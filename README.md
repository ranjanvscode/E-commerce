# 🛒 E-Commerce Application

This repository hosts a robust, full-stack e-commerce application featuring a modern web interface and a powerful Java Spring Boot backend. The backend is designed to manage all business logic, secure authentication, data persistence, and RESTful API interactions. Built with technologies like Java, Spring Boot, Spring Security, Hibernate, and MySQL, the application delivers a scalable, maintainable architecture with full support for product management, cart operations, order processing, and payment integration. It is optimized for ease of deployment using Docker.

## 📋 Table of Contents

- [Overview](#-overview)
- [Feature](#️-feature)  
- [Technology Used](#-technology-used)  
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instruction) 
- [Contact](#-contact)  
---

## 🚀 Overview
- **🧪 🛳 Containerized Deployment:** Builds and packages the application into Docker images for consistent environments and streamlined deployment.
- **🎨 🖥 Responsive UI Templates:** Utilizes Tailwind CSS to create visually appealing, mobile-friendly web interfaces.
- **🔒 🛡 Secure User Management:** Implements role-based access control, authentication, and profile handling with Spring Security.
- **💳 🌐 Payment & Media Integration:** Seamlessly connects with Razorpay for payments and Cloudinary for media storage.
- **🚀 ⚙ Modular Architecture:** Features clear separation of concerns with controllers, services, repositories, and DTOs for maintainability.
- **📧 ✉ Communication & Error Handling:** Supports email notifications via Brevo API and centralized exception management.
---
## 🚀 Features
- 🧑‍💼 User Registration & Login (with Role-based Authentication)
- 📦 Product CRUD and see all upcoming orders (Admin only)
- 💸 Discounts: Product-specific, category-specific, and global discounts supported.
- 🧾 Order & Cart Management with real-time updates
- 🔐 Password Reset: Secure password reset via email with token-based verification.
- 💳 Razorpay Integration for Payments
- 📂 Product Image Upload
- 📊 Category-wise Product Filtering
- 📃 Searching and Sorting
- 📮 Email Notifications
---
## 🛠️ Technologies Used

| Layer             | Technology                          |
|------------------|-------------------------------------|
| Language          | Java 17                             |
| Framework         | Spring Boot, Spring Security        |
| ORM               | Hibernate / JPA                     |
| Database          | MySQL                               |
| API Architecture  | RESTful APIs                        |
| Templating Engine | Thymeleaf                           |
| Frontend          | HTML,Tailwind CSS & Javascript      |
| Payment Gateway   | Razorpay                            |
| Image Service     | Cloudinary                          |
| Email Service     | Brevo                               |
| Build Tool        | Maven                               |
| Others            | Lombok, Git                         |

---

## 🗂️ Project Structure
* `src/`
    * `main/`
        * `java/`
            * `com/`
                * `ecommerce/`
                    * `controller/`
                    * `configuration/`
                    * `dto/`
                    * `entity/`
                    * `helper/`
                    * `repository/`
                    * `service/`
                    * `serviceInterface`
                    * `EcommerceApplication.java`
        * `resources/`
            * `static/`
            * `template/`
            * `application.properties`
            * `application-prod.properties`
---

## 🛠️ Setup Instructions (Local)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/ranjanvscode/E-commerce.git
   cd E-commerce
2. **Configure MySQL DB:**
   ```bash
   spring.datasource.driver-class-name=${DB_CLASS_NAME}
   spring.datasource.url=${DB_URL}
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
3. **Configure Razor Pay:**
   ```bash
   razorpay.api_key=${RAZORPAY_API_KEY}
   razorpay.api_secret=${RAZORPAY_API_SECRET}
3. **Configure Brevo API Key:**
   ```bash
    brevo.api.key=${BREVO_API_KEY}

3. **custom configuration properties:**
   ```bash
    app.shipping-fee=0
    app.remember-me-key=${REMEMBER_ME_KEY:dummy12345678}

3. **Configure Cloudinary:**
   ```bash
    cloudinary.cloud_name=${CLOUDINARY_CLOUD_NAME}
    cloudinary.api_key=${CLOUDINARY_API_KEY}
    cloudinary.api_secret=${CLOUDINARY_API_SECRET}
## 🧑‍💻 Contact
- Ranjan Kumar
- Backend Java Developer
- 📧 ranjangp2255@gmail.com
- 🔗 GitHub
- 🔗 LinkedIn
