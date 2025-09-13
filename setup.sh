#!/bin/bash

# setup.sh - Initial setup script for IntelliSent Blog

echo "🚀 Setting up IntelliSent Blog..."

# Check if Ruby is installed
if ! command -v ruby &> /dev/null; then
    echo "❌ Ruby is not installed. Please install Ruby 3.1+ first."
    echo "   Visit: https://www.ruby-lang.org/en/downloads/"
    exit 1
fi

# Check if Bundler is installed
if ! command -v bundle &> /dev/null; then
    echo "📦 Installing Bundler..."
    gem install bundler
fi

# Install Ruby dependencies
echo "📦 Installing Ruby dependencies..."
bundle install

# Check if Node.js is installed (optional)
if command -v npm &> /dev/null; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "⚠️  Node.js not found. Skipping asset optimization dependencies."
    echo "   Install Node.js for better asset optimization: https://nodejs.org/"
fi

# Create initial build
echo "🏗️  Building site for the first time..."
bundle exec jekyll build

# Success message
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure GitHub secrets for Azure deployment"
echo "   2. Update _config.yml with your GitHub repository details"
echo "   3. Run 'bundle exec jekyll serve' for local development"
echo "   4. Create your first GitHub Issue to test the integration"
echo ""
echo "🌐 Local development:"
echo "   bundle exec jekyll serve"
echo "   Open http://localhost:4000"
echo ""
echo "📚 Documentation:"
echo "   README.md - Full setup guide"
echo "   GitHub Issues - Content management"
echo ""
echo "Happy blogging! 🎉"
