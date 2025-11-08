FROM postgres:16.4

# Install build dependencies required to compile pgvector
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-16 \
 && rm -rf /var/lib/apt/lists/*

# Clone and build pgvector
RUN git clone https://github.com/pgvector/pgvector.git \
 && cd pgvector \
 && make \
 && make install

# Clean up build deps to keep image small
RUN apt-get remove -y build-essential git postgresql-server-dev-16 \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/* /pgvector

LABEL org.opencontainers.image.source="https://github.com/DashZeroAlionSystems/LightDom"
