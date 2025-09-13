# _plugins/github_issues.rb
require 'net/http'
require 'json'
require 'uri'
require 'date'

module Jekyll
  class GitHubIssuesGenerator < Generator
    safe true
    priority :high

    def generate(site)
      return unless site.config['github']
      
      username = site.config['github']['username']
      repo = site.config['github']['repository']
      token = site.config['github']['token'] || ENV['GITHUB_TOKEN'] || ENV['JEKYLL_GITHUB_TOKEN']
      
      puts "🔄 Fetching GitHub Issues from #{username}/#{repo}..."
      
      # Fetch issues from GitHub API
      issues = fetch_issues(username, repo, token)
      
      puts "📝 Found #{issues.length} issues to process"
      
      # Generate pages for each issue
      issues.each do |issue|
        puts "  Creating page for: #{issue['title']}"
        site.pages << IssuePage.new(site, site.source, issue)
      end
      
      # Create issues collection for listing
      site.data['issues'] = issues
      site.data['github_issues'] = {
        'total_count' => issues.length,
        'last_updated' => Time.now.iso8601,
        'repository' => "#{username}/#{repo}"
      }
      
      puts "✅ GitHub Issues integration complete!"
    end

    private

    def fetch_issues(username, repo, token = nil)
      uri = URI("https://api.github.com/repos/#{username}/#{repo}/issues")
      uri.query = URI.encode_www_form({
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: 100
      })

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      request = Net::HTTP::Get.new(uri)
      request['User-Agent'] = 'Jekyll-GitHub-Issues-Plugin'
      request['Accept'] = 'application/vnd.github.v3+json'
      
      # Add authorization header if token is provided
      if token && !token.empty?
        request['Authorization'] = "token #{token}"
      end

      response = http.request(request)
      
      unless response.code == '200'
        puts "⚠️  Warning: Failed to fetch issues (HTTP #{response.code})"
        puts "   Response: #{response.body[0..200]}"
        return []
      end

      issues = JSON.parse(response.body)
      
      # Filter out pull requests and process issues
      processed_issues = issues.reject { |issue| issue['pull_request'] }
                               .map { |issue| process_issue(issue) }
                               
      puts "📊 Processed #{processed_issues.length} issues (#{issues.length - processed_issues.length} pull requests filtered out)"
      
      processed_issues
    rescue => e
      puts "❌ Error fetching GitHub issues: #{e.message}"
      puts "   This might be due to rate limiting or network issues"
      []
    end

    def process_issue(issue)
      # Create a clean slug for the URL
      slug = issue['title'].downcase
                          .gsub(/\[.*?\]/, '') # Remove [ARTYKUŁ], [PYTANIE] etc.
                          .strip
                          .gsub(/[^a-z0-9\s-]/, '') # Remove special chars
                          .gsub(/\s+/, '-') # Spaces to hyphens
                          .gsub(/-+/, '-') # Multiple hyphens to single
                          .gsub(/^-|-$/, '') # Remove leading/trailing hyphens
      
      # Ensure slug is not empty
      slug = "issue-#{issue['number']}" if slug.empty?
      
      # Process labels for better categorization
      labels = issue['labels'].map { |label| 
        {
          'name' => label['name'],
          'color' => label['color'],
          'description' => label['description']
        }
      }
      
      # Extract category from labels
      category = extract_category(labels)
      
      # Clean up body content
      body = issue['body'] || ''
      
      {
        'number' => issue['number'],
        'title' => issue['title'],
        'clean_title' => issue['title'].gsub(/\[.*?\]\s*/, ''), # Remove prefixes
        'body' => body,
        'excerpt' => extract_excerpt(body),
        'created_at' => issue['created_at'],
        'updated_at' => issue['updated_at'],
        'html_url' => issue['html_url'],
        'user' => {
          'login' => issue['user']['login'],
          'avatar_url' => issue['user']['avatar_url'],
          'html_url' => issue['user']['html_url']
        },
        'labels' => labels,
        'category' => category,
        'comments_count' => issue['comments'],
        'slug' => slug,
        'url' => "/posts/#{slug}/",
        'date' => DateTime.parse(issue['created_at']).strftime('%Y-%m-%d'),
        'is_question' => labels.any? { |l| l['name'].downcase.include?('pytanie') || l['name'].downcase.include?('question') },
        'is_tutorial' => labels.any? { |l| l['name'].downcase.include?('tutorial') || l['name'].downcase.include?('poradnik') },
        'is_article' => labels.any? { |l| l['name'].downcase.include?('artykuł') || l['name'].downcase.include?('article') }
      }
    end
    
    def extract_category(labels)
      # Try to find a main category from labels
      priority_categories = ['intellisent', 'intelliapp', 'tutorial', 'pytanie', 'enhancement']
      
      main_category = labels.find { |label| 
        priority_categories.include?(label['name'].downcase) 
      }
      
      return main_category['name'] if main_category
      return labels.first['name'] if labels.any?
      'uncategorized'
    end
    
    def extract_excerpt(body)
      return '' if body.nil? || body.empty?
      
      # Remove markdown headers and formatting for excerpt
      clean_body = body.gsub(/^#+\s+/, '') # Remove headers
                       .gsub(/\*\*(.*?)\*\*/, '\1') # Remove bold
                       .gsub(/\*(.*?)\*/, '\1') # Remove italic
                       .gsub(/`(.*?)`/, '\1') # Remove code
                       .gsub(/\[(.*?)\]\(.*?\)/, '\1') # Remove links, keep text
                       .strip
      
      # Take first paragraph or first 200 characters
      paragraphs = clean_body.split(/\n\s*\n/)
      first_paragraph = paragraphs.first || ''
      
      if first_paragraph.length > 200
        first_paragraph[0..197] + '...'
      else
        first_paragraph
      end
    end
  end

  class IssuePage < Page
    def initialize(site, base, issue)
      @site = site
      @base = base
      @dir = "posts"
      @name = "#{issue['slug']}.html"

      self.process(@name)
      
      # Try to read the issue layout, fallback to post layout
      layout_file = File.exist?(File.join(base, '_layouts', 'issue.html')) ? 'issue.html' : 'post.html'
      self.read_yaml(File.join(base, '_layouts'), layout_file)
      
      # Set page data
      self.data['title'] = issue['clean_title']
      self.data['date'] = issue['created_at']
      self.data['author'] = issue['user']['login']
      self.data['labels'] = issue['labels']
      self.data['category'] = issue['category']
      self.data['github_url'] = issue['html_url']
      self.data['github_number'] = issue['number']
      self.data['comments_count'] = issue['comments_count']
      self.data['issue'] = issue
      self.data['excerpt'] = issue['excerpt']
      
      # Set layout
      self.data['layout'] = File.exist?(File.join(base, '_layouts', 'issue.html')) ? 'issue' : 'post'
      
      # Set content
      self.content = issue['body'] || ''
    end
  end
end
