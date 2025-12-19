FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"

# 3. Install Movement CLI
RUN curl -LO https://github.com/movementlabsxyz/homebrew-movement-cli/releases/download/bypass-homebrew/movement-move2-testnet-linux-x86_64.tar.gz \
 && mkdir temp_extract \
 && tar -xzf movement-move2-testnet-linux-x86_64.tar.gz -C temp_extract \
 && chmod +x temp_extract/movement \
 && mv temp_extract/movement /usr/local/bin/movement \
 && rm -rf temp_extract movement-move2-testnet-linux-x86_64.tar.gz

# ---------------------------------------------------------------------------
# 4. BAKE THE DEPENDENCIES (The Fix)
# We clone aptos-core once at build time. 
# We use --depth 1 to avoid downloading the entire git history (saves GBs).
# ---------------------------------------------------------------------------
WORKDIR /frameworks
RUN git clone --depth 1 --branch main https://github.com/aptos-labs/aptos-core.git

# 5. Setup App
WORKDIR /app
COPY . .
RUN pip3 install -r requirements.txt

EXPOSE 10000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]
