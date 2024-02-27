# Serverless Clean Architecture

[Serverless](https://www.serverless.com/) application following clean architecture and domain-driven design. The project is based on [TalkNotes](https://talknotes.io/), a platform that transcribes and summarizes audio files with the help of AI.

## :gear: Services

The application was built using the following services:

- [AWS Lambda](https://aws.amazon.com/lambda/) — Serverless compute service
- [AWS SES](https://aws.amazon.com/pt/ses/) — Email service
- [AWS S3](https://aws.amazon.com/s3/) — Object storage
- [AWS Transcribe](https://aws.amazon.com/transcribe/) — Speech-to-text service
- [AWS API Gateway](https://aws.amazon.com/api-gateway/) — API management
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/) — Relational database service
- [GPT-4](https://openai.com/research/gpt-4) — Text generation model

## :building_construction: Architecture

The project is structured into three layers: core, domain, and infrastructure. This design is intended to encapsulate distinct concerns within each layer, promoting a clean separation of responsibilities.

```plaintext
.
├── core
│   ├── entities (foundational abstractions)
│   ├── errors (standardized error types)
│   ├── protocols (common interfaces and abstractions)
│   └── ...
├── domain
│   ├── notes
│   │   ├── entities (domain-specific models)
│   │   ├── protocols (domain interface contracts)
│   │   ├── repositories (abstractions for data persistence)
│   │   └── services (domain logic handlers)
│   └── ...
└── infrastructure (external services and frameworks)
    ├── aws
    │   ├── lambda
    │   ├── s3
    │   ├── ses
    │   └── transcribe
    └── ...
```

### Core

In the core layer we define the foundational building blocks of the system. This includes the base entity classes and interfaces (protocols), as well as a suite of common errors, protocols and utility functions to be used across the application. The core layer serves as the base for higher-level constructs, ensuring consistency and reusability across the system.

### Domain

The domain layer encapsulates the application's business logic and use cases. It is structured into modules, each corresponding to a distinct functional area or "domain" within the system. Within these modules, you'll find domain-specific entities, interface contracts (protocols), data repository abstractions, and service handlers (use cases) that coordinate domain operations.

The domain services are the heart of the application, containing the business logic and use case implementations. These services are designed to be independent of external dependencies, allowing them to be easily tested and reused across different contexts. External services are defined as protocols, which are implemented in the infrastructure layer.

### Infrastructure

The infrastructure layer contains the implementation details for external services and frameworks. This includes AWS Lambda functions, S3 storage, SES email service, GPT integration, and other infrastructure-specific code. The infrastructure layer is responsible for integrating with external services and providing the necessary glue code to connect the application to the outside world.

If needed to change any external service, the infrastructure layer is the only one that should be affected. The domain layer should remain unchanged, as it is completely decoupled from the infrastructure layer. This separation of concerns allows for easy maintenance, testing, and reusability of the domain logic, while still providing flexibility to adapt to changes in the external environment.

## :memo: License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
