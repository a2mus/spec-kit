FROM python:3.9-slim

WORKDIR /app

# Install simulator dependencies
RUN pip install requests

COPY . .

# Run in continuous mode by default
CMD ["python", "beaglebone_vm.py", "--mode", "continuous", "--interval", "5", "--cattle", "1001,1002,1003"]
