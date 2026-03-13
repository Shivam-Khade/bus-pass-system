📌 Problem Statement
  
The existing bus pass system of PMPML currently provides only a daily pass facility, lacking flexible options such as monthly, quarterly, and yearly passes. This limitation reduces convenience for regular commuters like normal users and students who require long-term travel solutions.

Additionally, the current system does not include any emergency or safety mechanism for passengers. There is no integrated SOS feature that allows users to request immediate assistance during emergencies.

To address these gaps, this project introduces:

📅 Multiple pass options (Monthly, Quarterly, and Yearly) to provide flexible and cost-effective travel solutions for regular commuters.

🆘 Integrated SOS alert system with real-time location coordinates, enabling passengers to request immediate assistance during emergencies.

💳 Secure digital payment simulation to streamline the pass purchasing process in a safe and efficient manner.

📲 QR-based digital pass verification for quick, contactless, and tamper-proof validation.

This solution enhances flexibility, safety, and digital accessibility compared to the existing system.
<br><br> 

✨ KEY FEATURES

👤 For Users (Normal Users / Students)

📝 Apply for bus pass online

📄 Upload required documents (Bonafide, etc.)

🔄 Track application status (Pending → Approved)

💳 Secure online payments via Razorpay

📲 QR-based Digital E-Pass verification

📥 Download pass as PDF

🆘 SOS alert with location sharing

🔑 For Admin

📊 Interactive dashboard overview

✅ Approve or ❌ reject applications

👥 Manage users and roles

🚨 Real-time SOS alert monitoring

🔐 OTP-based secure registration

🛡️ SECURITY

🔐 JWT Authentication

👮 Role-Based Access Control (RBAC)

📲 Secure OTP Verification
<br><br> 

📂 Project Structure

├── app/                        # Spring Boot Backend  
│   ├── src/main/java/          # Controllers, Services, DAO, Models  
│   ├── src/main/resources/     # Configuration files & SQL scripts  
│   └── pom.xml                 # Maven dependencies  
│  
├── bus-pass-frontend/          # React + Vite Frontend  
│   ├── src/pages/              # User & Admin UI pages  
│   ├── src/components/         # Reusable UI components  
│   └── package.json            # Frontend dependencies  
│  
└── db.sql                      # Main database schema  
<br><br>  

🚀 SETUP INSTRUCTIONS

1️⃣ Database  
CREATE DATABASE bus_pass_db;  
Import db.sql  

2️⃣ Backend
cd app  
mvn clean install  
mvn spring-boot:run  

3️⃣ Frontend
cd bus-pass-frontend  
npm install  
npm run dev
