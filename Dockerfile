# STEP 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# STEP 2: Run the Application
FROM eclipse-temurin:17-jdk-jammy

# Create a non-root user (Hugging Face security requirement)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy the JAR from the builder stage
COPY --from=builder --chown=user /app/target/*.jar app.jar

# Hugging Face listens on port 7860
EXPOSE 7860

# Force Spring Boot to use port 7860 and the production profile
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=7860", "--spring.profiles.active=prod"]