// ============================================
// DATABASE SYNCHRONIZATION
// ============================================

const { sequelize } = require("./models");

const syncDatabase = async () => {
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: Create all tables WITHOUT foreign keys first
    // This prevents "Failed to open the referenced table" errors
    // ─────────────────────────────────────────────────────────────────
    console.log("📦 Creating base tables...");
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Base tables created");

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: Add columns that might be missing (safe ALTER TABLEs)
    // Wrapped in try-catch so they're no-ops if already exist
    // ─────────────────────────────────────────────────────────────────
    console.log("🔧 Adding missing columns...");

    const safeAlter = async (sql, description) => {
      try {
        await sequelize.query(sql);
        console.log(`   ✓ ${description}`);
      } catch (e) {
        // Column/table already exists - ignore
      }
    };

    // Students table
    await safeAlter(`ALTER TABLE students ADD COLUMN is_full_course BOOLEAN DEFAULT false;`, 'students.is_full_course');

    // Student fees table
    await safeAlter(`ALTER TABLE student_fees ADD COLUMN reminder_date DATE;`, 'student_fees.reminder_date');

    // Subscriptions table
    await safeAlter(`ALTER TABLE subscriptions ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;`, 'subscriptions.discount_amount');
    await safeAlter(`ALTER TABLE subscriptions ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0;`, 'subscriptions.tax_amount');

    // Attendance biometric columns
    await safeAlter(`ALTER TABLE attendances ADD COLUMN marked_by_type ENUM('manual','biometric','mobile_otp','qr_code') DEFAULT 'manual';`, 'attendances.marked_by_type');
    await safeAlter(`ALTER TABLE attendances ADD COLUMN biometric_punch_id BIGINT NULL;`, 'attendances.biometric_punch_id');
    await safeAlter(`ALTER TABLE attendances ADD COLUMN time_in TIME NULL;`, 'attendances.time_in');
    await safeAlter(`ALTER TABLE attendances ADD COLUMN time_out TIME NULL;`, 'attendances.time_out');
    await safeAlter(`ALTER TABLE attendances ADD COLUMN is_late BOOLEAN DEFAULT false;`, 'attendances.is_late');
    await safeAlter(`ALTER TABLE attendances ADD COLUMN late_by_minutes INT DEFAULT 0;`, 'attendances.late_by_minutes');
    await safeAlter(`ALTER TABLE attendances ADD COLUMN is_half_day BOOLEAN DEFAULT false;`, 'attendances.is_half_day');

    // Public page features
    await safeAlter(`ALTER TABLE plans ADD COLUMN feature_public_page BOOLEAN DEFAULT false;`, 'plans.feature_public_page');
    await safeAlter(`ALTER TABLE institutes ADD COLUMN current_feature_public_page BOOLEAN DEFAULT false;`, 'institutes.current_feature_public_page');
    await safeAlter(`ALTER TABLE institute_reviews ADD COLUMN sort_order INT DEFAULT 0;`, 'institute_reviews.sort_order');
    await safeAlter(`ALTER TABLE institute_reviews ADD COLUMN is_approved BOOLEAN DEFAULT true;`, 'institute_reviews.is_approved');
    await safeAlter(`ALTER TABLE institute_gallery_photos ADD COLUMN sort_order INT DEFAULT 0;`, 'institute_gallery_photos.sort_order');

    // Free trial columns
    await safeAlter(`ALTER TABLE plans ADD COLUMN is_free_trial BOOLEAN DEFAULT false;`, 'plans.is_free_trial');
    await safeAlter(`ALTER TABLE plans ADD COLUMN trial_days INT DEFAULT 14;`, 'plans.trial_days');
    await safeAlter(`ALTER TABLE institutes ADD COLUMN has_used_trial BOOLEAN DEFAULT false;`, 'institutes.has_used_trial');

    console.log("✅ All columns updated");

    // ─────────────────────────────────────────────────────────────────
    // STEP 3: Sync specific models that need alter:true
    // Only for models that change frequently
    // ─────────────────────────────────────────────────────────────────
    console.log("🔄 Syncing specific models...");
    try {
      const {
        InstitutePublicProfile,
        InstituteGalleryPhoto,
        InstituteReview,
        PublicEnquiry,
        Subscription,
        Plan
      } = require('./models');

      await InstitutePublicProfile.sync({ alter: false });
      await InstituteGalleryPhoto.sync({ alter: false });
      await InstituteReview.sync({ alter: false });
      await PublicEnquiry.sync({ alter: false });
      await Subscription.sync({ alter: false });
      await Plan.sync({ alter: false });

      console.log("✅ Specific models synced");
    } catch (e) {
      console.warn("⚠️ Specific model sync skipped:", e.message);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 4: Add performance indexes
    // ─────────────────────────────────────────────────────────────────
    console.log("📊 Adding indexes...");
    await safeAlter(`CREATE INDEX idx_profile_slug ON institute_public_profiles(slug);`, 'idx_profile_slug');
    await safeAlter(`CREATE INDEX idx_gallery_inst ON institute_gallery_photos(institute_id);`, 'idx_gallery_inst');
    await safeAlter(`CREATE INDEX idx_reviews_inst ON institute_reviews(institute_id);`, 'idx_reviews_inst');
    await safeAlter(`CREATE INDEX idx_enquiry_inst ON public_enquiries(institute_id, status, created_at);`, 'idx_enquiry_inst');
    console.log("✅ Indexes added");

    // ─────────────────────────────────────────────────────────────────
    // STEP 5: Seed initial data
    // ─────────────────────────────────────────────────────────────────
    console.log("🌱 Seeding initial data...");
    const seedPlans = require("./seeders/seedPlans");
    await seedPlans();
    console.log("✅ Plans seeded");

    const createSuperAdmin = require("./seeders/createSuperAdmin");
    await createSuperAdmin();
    console.log("✅ Super admin created");

    console.log("✅✅✅ Database fully synchronized and ready!");

  } catch (error) {
    console.error("❌❌❌ Database error:", error.message);
    console.error("Full error:", error);
    console.error("Please ensure MySQL is running and database 'student_saas' exists");
    process.exit; // Exit the process - Railway will restart it
  }
};

// Export syncDatabase function so server.js can call it
module.exports = { app, syncDatabase };