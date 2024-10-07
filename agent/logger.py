# logger.py
import logging
import os
from dotenv import load_dotenv
from logging import StreamHandler

# Load environment variables from a .env file
load_dotenv()

# Configure logger
def configure_logger() -> logging.Logger:
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    
    logger = logging.getLogger(__name__)
    logger.setLevel(log_level)

    # Create console handler
    console_handler = StreamHandler()

    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # Set formatter for the console handler
    console_handler.setFormatter(formatter)

    # Add console handler to the logger
    logger.addHandler(console_handler)

    return logger

# Initialize logger
logger = configure_logger()

# Example usage
if __name__ == "__main__":
    logger.info("Logger is configured and running.")
