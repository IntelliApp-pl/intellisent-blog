require 'dotenv'

# Load environment variables from .env file if it exists
if File.exist?('.env')
  Dotenv.load('.env')
end