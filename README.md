Project Name: UniTrade – Student Marketplace Platform

1. Project Sponsor
The project sponsor is TM3 Group members, working under the supervision of the academic project supervisor. The development team will be responsible for system design, development, and testing. The primary contact for the project will be Reotshepile Stock.

2. Project Overview

UniTrade is a web-based platform developed exclusively for students at Cape Peninsula University of Technology (CPUT). The platform enables students to buy and sell goods and services within a trusted, university-restricted environment.
By limiting access to verified CPUT students only, the platform fosters a safe and convenient marketplace tailored to the needs of the student community. A key objective is to significantly reduce WhatsApp-based scammers who prey on students by providing a secure and verified trading environment.
The application will be built using Spring Boot as the backend framework, providing a robust, scalable, and secure RESTful API layer, paired with a browser-based frontend for accessibility across devices without requiring installation.

3. Business Need
University students often require affordable items such as textbooks, electronics, furniture, clothing, and services—especially during registration and relocation periods. Existing public marketplaces are not designed specifically for students and often expose users to scams, unreliable sellers, and unsafe transactions.
There is a clear need for a secure, student-focused digital marketplace that connects verified students, enables safe peer-to-peer trading, reduces fraud risk, and provides affordable access to essential goods and services.

4. Project Objectives
•	Develop a secure, university-restricted web marketplace accessible only to verified CPUT students
•	Allow students to list, browse, and purchase products and services from fellow students
•	Implement a reliable order and (simulated) payment system to facilitate transactions
•	Provide an admin dashboard for platform monitoring, user management, and content moderation
•	Deliver a clean, user-friendly browser-based interface that requires no installation

5. Scope
5.1 In Scope
•	User registration, login, and authentication (restricted to CPUT students via student email domain)
•	Product listing creation, editing, and deletion by sellers
•	Product search, filtering, and browsing by buyers
•	Order placement and simulated payment processing system
•	Admin dashboard for user management, listing moderation, and order oversight
•	Spring Boot REST API backend with SQL database integration
•	Browser-based frontend web interface
•	Role-based access control (Student and Administrator)

5.2 Future Enhancements (If Time Permits)
•	Mobile application development (Android / iOS)
•	Integration with external third-party payment gateways (e.g., PayPal, Stripe)
•	Real-time messaging or chat between users
•	Advanced ratings and reviews analytics
•	Deployment to a live production server

6. Business Requirements

6.1 Authentication & User Management
•	Student registration using CPUT student email
•	Email verification to confirm student identity
•	Secure login with password hashing (e.g., BCrypt via Spring Security)
•	Role-based access control (Student – Buyer/Seller, Administrator)

6.2 Product Listings & Search
•	Create listings with title, description, price, category, condition, and images
•	Categories may include: Textbooks, Electronics, Clothing, Services, Food, and Other
•	Search listings by keyword
•	Filter by category, price range, and location
•	Sellers can edit/delete their own listings
•	Listing status tracking: Active, Sold, or Removed

6.3 Order & Payment System (Simulated)
•	Buyers can place orders directly through the platform
•	Order summary and confirmation before finalizing purchase
•	Simulated payment workflow to demonstrate end-to-end transaction processing
•	Order history for buyers
•	Sellers receive order notifications and mark orders as fulfilled

6.4 Communication & Trust
•	In-app messaging system (if implemented within scope)
•	Ratings and reviews system
•	Reporting mechanism for inappropriate or suspicious activity
•	Secure data storage and privacy protection

6.5 Admin Dashboard
•	View and manage registered users
•	Suspend or remove users violating platform rules
•	Moderate product listings
•	Monitor order activity and transaction logs
•	Dashboard statistics: total users, active listings, orders placed

7. Business Value
The UniTrade platform will:
•	Reduce student expenses by providing affordable goods and services
•	Significantly reduce scam and fraud risks within the student community
•	Provide convenience during busy academic periods
•	Support sustainability through reuse of goods
•	Allow students to generate income from unused items
•	Strengthen campus community engagement
•	Promote digital transformation within the university

8. Constraints & Assumptions
•	Platform restricted to verified CPUT students only
•	Payment processing will be simulated (no real financial transactions)
•	Development must align with academic timelines and limited resources
•	Initial deployment will be local
•	System must be designed for scalability to support future campus expansion
•	All team members have basic working knowledge of Java and Spring Boot
•	GitHub will be used for version control and team collaboration

9. Deliverables
•	Fully functional Spring Boot web application (source code hosted on GitHub)
•	Project scope document
•	System design documentation (ER diagrams, Use Case diagrams)
•	Final project report submitted to Supervisor
•	Project demonstration / presentation
