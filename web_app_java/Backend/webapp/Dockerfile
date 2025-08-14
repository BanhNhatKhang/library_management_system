FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copy Maven wrapper và pom trước để tận dụng cache
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Tải dependency 
RUN ./mvnw dependency:go-offline

# Copy source code 
COPY src src

# Build project, resources sẽ được đóng gói vào jar
RUN ./mvnw clean package -DskipTests

EXPOSE 8080
CMD ["java", "-jar", "target/webapp-0.0.1-SNAPSHOT.jar"]
