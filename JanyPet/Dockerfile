FROM maven:3-openjdk-17 AS build
WORKDIR /app

COPY JanyPet .
RUN mvn clean package -DskipTests


# Run stage

FROM openjdk:17-jdk-slim
WORKDIR /app

COPY --from=build /app/target/JanyPet-0.0.1-SNAPSHOT.war JanyPet.war
EXPOSE 8080

ENTRYPOINT ["java","-jar","JanyPet.war"]
