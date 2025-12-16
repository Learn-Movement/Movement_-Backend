FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Movement CLI
RUN curl -fsSL https://movementlabs.xyz/install.sh | bash

# Ensure binary is in PATH
ENV PATH="/root/.movement/bin:${PATH}"

# Verify installation at build time
RUN movement --version

CMD ["bash", "-c", "echo 'Movement CLI is running' && sleep infinity"]

