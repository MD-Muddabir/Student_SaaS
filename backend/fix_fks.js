const { sequelize } = require('./models');

async function fixForeignKeys() {
  try {
    console.log("Authenticating against database...");
    await sequelize.authenticate();
    console.log("Connected. Fixing foreign keys...");

    const queries = [
      `ALTER TABLE institute_public_profiles DROP CONSTRAINT IF EXISTS institute_public_profiles_institute_id_fkey;`,
      `ALTER TABLE institute_public_profiles ADD CONSTRAINT institute_public_profiles_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE institute_gallery_photos DROP CONSTRAINT IF EXISTS institute_gallery_photos_institute_id_fkey;`,
      `ALTER TABLE institute_gallery_photos ADD CONSTRAINT institute_gallery_photos_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE institute_reviews DROP CONSTRAINT IF EXISTS institute_reviews_institute_id_fkey;`,
      `ALTER TABLE institute_reviews ADD CONSTRAINT institute_reviews_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE institute_discounts DROP CONSTRAINT IF EXISTS institute_discounts_institute_id_fkey;`,
      `ALTER TABLE institute_discounts ADD CONSTRAINT institute_discounts_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE public_enquiries DROP CONSTRAINT IF EXISTS public_enquiries_institute_id_fkey;`,
      `ALTER TABLE public_enquiries ADD CONSTRAINT public_enquiries_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE class_sessions DROP CONSTRAINT IF EXISTS class_sessions_institute_id_fkey;`,
      `ALTER TABLE class_sessions ADD CONSTRAINT class_sessions_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE timetable_slots DROP CONSTRAINT IF EXISTS timetable_slots_institute_id_fkey;`,
      `ALTER TABLE timetable_slots ADD CONSTRAINT timetable_slots_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE timetables DROP CONSTRAINT IF EXISTS timetables_institute_id_fkey;`,
      `ALTER TABLE timetables ADD CONSTRAINT timetables_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE transport_fees DROP CONSTRAINT IF EXISTS transport_fees_institute_id_fkey;`,
      `ALTER TABLE transport_fees ADD CONSTRAINT transport_fees_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE razorpay_orders DROP CONSTRAINT IF EXISTS razorpay_orders_institute_id_fkey;`,
      `ALTER TABLE razorpay_orders ADD CONSTRAINT razorpay_orders_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE razorpay_payments DROP CONSTRAINT IF EXISTS razorpay_payments_institute_id_fkey;`,
      `ALTER TABLE razorpay_payments ADD CONSTRAINT razorpay_payments_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_institute_id_fkey;`,
      `ALTER TABLE invoices ADD CONSTRAINT invoices_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE fee_discount_logs DROP CONSTRAINT IF EXISTS fee_discount_logs_institute_id_fkey;`,
      `ALTER TABLE fee_discount_logs ADD CONSTRAINT fee_discount_logs_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE biometric_settings DROP CONSTRAINT IF EXISTS biometric_settings_institute_id_fkey;`,
      `ALTER TABLE biometric_settings ADD CONSTRAINT biometric_settings_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`,
      
      `ALTER TABLE assignment_settings DROP CONSTRAINT IF EXISTS assignment_settings_institute_id_fkey;`,
      `ALTER TABLE assignment_settings ADD CONSTRAINT assignment_settings_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;`
    ];

    for (const q of queries) {
      await sequelize.query(q);
      console.log("Executed: ", q.substring(0, 50) + "...");
    }
    console.log("All foreign keys updated to CASCADE.");
    process.exit(0);
  } catch (err) {
    console.error("Error running fix:", err);
    process.exit(1);
  }
}

fixForeignKeys();
