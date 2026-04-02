/**
 * Payment / Checkout Page
 * Handles new subscriptions and renewals
 * Simulates payment flow if Razorpay keys are missing
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useRazorpayPayment } from "../../hooks/useRazorpayPayment";
import "./PublicPages.css";

function PaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get plan details from URL or local state
    const [planId, setPlanId] = useState(searchParams.get("plan_id"));
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [billingCycle, setBillingCycle] = useState("monthly");
    const [hasUsedTrial, setHasUsedTrial] = useState(false);
    const [isTestMode, setIsTestMode] = useState(true);

    useEffect(() => {
        // If logged in, fetch current pending plan or plan from URL
        fetchPlanDetails();
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            // First check if user is logged in
            // If so, we might get plan from their pending subscription
            // For now, let's just fetch the plan from IDs
            if (!planId) {
                // Try fetching user profile to see if they have a pending plan
                try {
                    const profile = await api.get("/auth/profile");

                    if (profile.data.user && profile.data.user.Institute) {
                        const institute = profile.data.user.Institute;

                        if (institute.plan_id) {
                            // If we have a plan ID, use it!
                            // Also if we have Plan details directly, we can skip one API call, but let's stick to the flow
                            setPlanId(institute.plan_id);
                            setHasUsedTrial(institute.has_used_trial || false);

                            // If plan is already in the include, use it
                            if (institute.Plan) {
                                setPlan(institute.Plan);
                                setLoading(false);
                                return; // Skip the rest
                            }
                        } else {
                            // No plan associated, go to pricing
                            navigate("/pricing");
                            return;
                        }
                    } else {
                        navigate("/login");
                        return;
                    }
                } catch (e) {
                    navigate("/login");
                    return;
                }
            } else {
                // If they provided planId in URL, fetch their profile just to get hasUsedTrial
                try {
                    const profile = await api.get("/auth/profile");
                    if (profile.data.user && profile.data.user.Institute) {
                        setHasUsedTrial(profile.data.user.Institute.has_used_trial || false);
                    }
                } catch (e) {
                    // ignore if not logged in (handled by registration)
                }
            }

            // If we still don't have a plan set (because we only had ID), fetch from list
            const response = await api.get("/plans");
            const currentPlanId = planId || (plan ? plan.id : null);

            if (currentPlanId) {
                const selectedPlan = response.data.data.find(p => p.id === parseInt(currentPlanId));
                if (selectedPlan) {
                    setPlan(selectedPlan);
                } else {
                    alert("Invalid Plan");
                    navigate("/pricing");
                }
            } else {
                navigate("/pricing");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const { initializePayment, isPaymentLoading } = useRazorpayPayment();

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Initiate Payment (Backend decides if it's a free trial based on `!institute.has_used_trial`)
            const initResponse = await api.post("/payment/initiate", {
                planId: plan.id,
                billingCycle,
                testMode: isTestMode
            });

            // If backend handles free trial via initiate, it might just return success immediately without key
            if (initResponse.data.trial_activated) {
                alert("Free Trial Activated Successfully! Redirecting to Dashboard...");
                window.location.href = "/admin/dashboard";
                return;
            }

            const { order, key, institute_name } = initResponse.data;

            if (key === "rzp_test_mock") {
                // Mock verification flow
                const confirmMock = window.confirm(`Mock Payment Gateway\n\nPay ₹${order.amount / 100} for ${plan.name}?\n\nClick OK to succeed, Cancel to fail.`);
                if (confirmMock) {
                    try {
                        const verifyRes = await api.post("/payment/verify", {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: `pay_mock_${Date.now()}`,
                            razorpay_signature: "mock_signature",
                            planId: plan.id,
                            billingCycle
                        });
                        if (verifyRes.data.success) {
                            alert("Payment Successful! Redirecting to Dashboard...");
                            window.location.href = "/admin/dashboard";
                        }
                    } catch (verifyError) {
                        alert("Payment Verification Failed: " + verifyError.response?.data?.message);
                    }
                }
                setProcessing(false);
            } else {
                // 2. Initialize Razorpay Checkout
                setProcessing(false); // Let the hook manage loading state
                initializePayment({
                    orderConfig: {
                        key: key,
                        amount: order.amount,
                        currency: order.currency,
                        order_id: order.id,
                    },
                    userConfig: {
                        institute_name: institute_name || "EduManage SaaS",
                        description: `Subscription for ${plan.name}`,
                        name: "Institute Admin", // Could get from profile
                        email: "admin@example.com",
                        contact: ""
                    },
                    onSuccess: async (paymentData) => {
                        try {
                            const verifyRes = await api.post("/payment/verify", {
                                razorpay_order_id: paymentData.razorpay_order_id,
                                razorpay_payment_id: paymentData.razorpay_payment_id,
                                razorpay_signature: paymentData.razorpay_signature,
                                planId: plan.id,
                                billingCycle
                            });

                            if (verifyRes.data.success) {
                                alert("Payment Successful! Redirecting to Dashboard...");
                                window.location.href = "/admin/dashboard";
                            }
                        } catch (verifyError) {
                            alert("Payment Verification Failed: " + verifyError.response?.data?.message);
                        }
                    },
                    onFailure: (errDesc) => {
                        alert(`Payment Failed: ${errDesc}`);
                    }
                });
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Payment initiation failed: " + (error.response?.data?.message || error.message));
            setProcessing(false);
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    if (!plan) return null;

    const price = billingCycle === 'yearly'
        ? Math.round(plan.price * 12 * 0.8)
        : plan.price;

    return (
        <div className="payment-page">
            <div className="container-small">
                <div className="payment-card">
                    <div className="payment-header">
                        <h2>{(plan.is_free_trial && !hasUsedTrial) ? "Start Your Free Trial" : "Complete Your Subscription"}</h2>
                        <p>{(plan.is_free_trial && !hasUsedTrial) ? `Activate secure trial for ${plan.name}` : `Secure payment for ${plan.name}`}</p>
                    </div>

                    {!(plan.is_free_trial && !hasUsedTrial) && (
                        <div className="billing-cycle-selector">
                            <label className={billingCycle === 'monthly' ? 'active' : ''}>
                                <input
                                    type="radio"
                                    name="billing"
                                    value="monthly"
                                    checked={billingCycle === 'monthly'}
                                    onChange={() => setBillingCycle('monthly')}
                                />
                                Monthly (₹{plan.price}/mo)
                            </label>
                            <label className={billingCycle === 'yearly' ? 'active' : ''}>
                                <input
                                    type="radio"
                                    name="billing"
                                    value="yearly"
                                    checked={billingCycle === 'yearly'}
                                    onChange={() => setBillingCycle('yearly')}
                                />
                                Yearly (Save 20%)
                            </label>
                        </div>
                    )}

                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Plan</span>
                            <span>{plan.name}</span>
                        </div>
                        {!(plan.is_free_trial && !hasUsedTrial) && (
                            <div className="summary-row">
                                <span>Billing Cycle</span>
                                <span>{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total Amount</span>
                            <span>{(plan.is_free_trial && !hasUsedTrial) ? '₹0' : `₹${price}`}</span>
                        </div>
                    </div>

                    {!(plan.is_free_trial && !hasUsedTrial) && (
                        <div className="payment-mode-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <span style={{ fontWeight: isTestMode ? '600' : '400', color: isTestMode ? 'var(--primary-color, #3f51b5)' : '#666' }}>Test Mode</span>
                            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={!isTestMode} 
                                    onChange={(e) => setIsTestMode(!e.target.checked)} 
                                    style={{ opacity: 0, width: 0, height: 0, margin: 0, padding: 0 }}
                                />
                                <span style={{
                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: isTestMode ? '#ccc' : 'var(--primary-color, #3f51b5)', transition: '.3s', borderRadius: '34px'
                                }}>
                                    <span style={{
                                        position: 'absolute', height: '20px', width: '20px', left: '3px', bottom: '3px',
                                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%',
                                        transform: isTestMode ? 'translateX(0)' : 'translateX(24px)',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}></span>
                                </span>
                            </label>
                            <span style={{ fontWeight: !isTestMode ? '600' : '400', color: !isTestMode ? 'var(--primary-color, #3f51b5)' : '#666' }}>Real Mode</span>
                        </div>
                    )}

                    <button
                        className="btn-primary-large btn-block"
                        onClick={handlePayment}
                        disabled={processing || isPaymentLoading}
                    >
                        {processing || isPaymentLoading ? "Processing..." : ((plan.is_free_trial && !hasUsedTrial) ? "Start Free Trial" : `Pay ₹${price}`)}
                    </button>

                    {!(plan.is_free_trial && !hasUsedTrial) && (
                        <div className="secure-badge" style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#666', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Secured by Razorpay ({isTestMode ? 'Test Mode' : 'Live Mode'})
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;
