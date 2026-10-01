NYUMBANI HOTEL DIGITAL CUSTOMER FEEDBACK WEB APP

LATEST COMPLETE LOCAL VERSION

Included:
- Real Nyumbani bedroom image from your supplied photo
- Real Nyumbani logo cropped from your supplied hotel flyer
- Resident and Non-Resident feedback
- Resident Room Number is REQUIRED
- Feedback date and time recorded AUTOMATICALLY
- Objective answers:
    Very Good
    Good
    Average
    Poor
    Very Poor
- Hidden scores only for analytics
- Printed reports DO NOT show 5/5 scores or stars
- Bubble/pop visual feedback with NO sound
- Automatic complaint flag for low overall hidden score
- Staff-role popup before login:
    Manager
    Receptionist
    System Admin
- Role display after login
- Staff enrollment restricted to System Admin
- Dashboard, feedback list, complaints and reports
- Individual feedback print report
- Category-only report
- Date-range filtering
- Resident/Non-Resident filtering
- Distribution counts for each objective answer
- Print-ready reports
- database.sql starter schema for later Supabase/PostgreSQL connection

TESTING
1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Run index.html with Live Server.
4. Submit Resident and Non-Resident feedback.
5. Choose Staff Login > a role.
6. For the current local demo, use any valid email and any password of 4+ characters.
7. Open Reports to print detailed/category reports.

IMPORTANT
This package is fully functional for local testing using browser localStorage.
For real deployment across multiple guest phones, the next step is connecting the included database schema to Supabase/PostgreSQL and replacing demo authentication with real staff authentication.


AI / MACHINE LEARNING ADDED
- AI comment analysis
- Positive / Neutral / Negative sentiment
- Department detection
- Issue detection
- Urgency detection
- AI Insights admin page
- FastAPI Python AI backend
- PyTorch neural-network training module
- TensorFlow/Keras neural-network training module
- Deep-learning starter architecture
- Sample labelled training dataset
- Browser fallback when Python AI server is not running

See AI_SETUP.txt before running the Python AI backend.


SYSTEM RESET / MONTHLY CLOSE ADDED
- System Admin > Settings
- Monthly reset requires:
  1. confirmation that the monthly report was saved/printed
  2. typing RESET MONTH
- Monthly reset removes local guest records and personal details:
  names, phones, emails, room numbers, comments, complaints and AI analysis
- Before deletion, the app stores an anonymous aggregate monthly summary
- Staff reset is separate from guest data reset
- Option to remove Manager/Receptionist accounts while keeping System Admin
- Option to remove all demo staff accounts
- Factory reset requires typing FACTORY RESET
- Settings is restricted to System Admin

IMPORTANT FOR REAL DEPLOYMENT
The reset controls in this local version operate on browser localStorage.
When Supabase is connected, destructive actions must be implemented server-side with strict System Admin authorization, database backup/export, audit logging, and confirmation.
