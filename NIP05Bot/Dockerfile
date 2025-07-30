# Use the official Deno image from Docker Hub
FROM denoland/deno:1.46.3

# Set working directory inside the container
WORKDIR /app

# Copy all files to the working directory
COPY . .

# Cache dependencies
RUN deno cache server.js

# Expose the port the app runs on (assuming default Deno port 8000)
EXPOSE 8000

# Run the Deno application
CMD ["deno", "run", "--allow-net", "--allow-env", "server.js"]