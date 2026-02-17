import { useNavigate } from "react-router-dom";
import "./Buttons.css";

const BackButton = ({ to = "/superadmin/dashboard", label = "Back to Dashboard", variant = "default" }) => {
    const navigate = useNavigate();

    return (
        <button
            className={`animated-btn ${variant}`}
            onClick={() => navigate(to)}
        >
            <span className="icon icon-back">←</span>
            {label}
        </button>
    );
};

export default BackButton;
