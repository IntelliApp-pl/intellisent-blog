# IntelliSent Blog

🚀 Blog o systemach SENT i automatyzacji przewozów, bazujący na GitHub Issues.

## 📋 Opis

Ten blog wykorzystuje GitHub Issues jako system zarządzania treścią (CMS), automatycznie generując piękne strony Jekyll z każdego Issue. Treści są automatycznie deployowane do Azure Web App.

## 🛠️ Technologie

- **Jekyll** - generator stron statycznych
- **GitHub Issues** - system zarządzania treścią
- **GitHub Actions** - automatyczne budowanie i deployment
- **Azure Web App** - hosting
- **Bootstrap 5** - framework CSS
- **Font Awesome** - ikony

## 🚀 Funkcje

- ✅ Automatyczne generowanie postów z GitHub Issues
- ✅ Piękny, responsywny design
- ✅ Filtrowanie postów według kategorii
- ✅ Wyszukiwarka
- ✅ SEO-friendly URLs
- ✅ Automatyczny deployment do Azure
- ✅ Komentarze przez GitHub Issues
- ✅ Szablony dla różnych typów treści

## 📝 Jak dodać treść

### Przez GitHub Issues

1. Przejdź do [Issues](https://github.com/IntelliApp-pl/intellisent-blog/issues)
2. Kliknij "New issue"
3. Wybierz odpowiedni szablon:
   - 📝 **Artykuł na blog** - dla artykułów
   - ❓ **Pytanie techniczne** - dla Q&A
   - 💡 **Propozycja funkcji** - dla propozycji
   - 🐛 **Zgłoszenie błędu** - dla błędów

### Labelki

Używaj labelek do kategoryzacji:
- `intellisent` - treści o IntelliSent
- `intelliapp` - treści o IntelliApp
- `artykuł` - artykuły
- `pytanie` - pytania
- `tutorial` - poradniki
- `enhancement` - propozycje funkcji

## 🔧 Development

### Wymagania

- Ruby 3.1+
- Bundler
- Node.js 18+ (opcjonalnie, dla optymalizacji)

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/IntelliApp-pl/intellisent-blog.git
cd intellisent-blog

# Instalacja zależności Ruby
bundle install

# Instalacja zależności Node.js (opcjonalnie)
npm install

# Konfiguracja zmiennych środowiskowych (opcjonalnie)
cp .env.example .env
# Edytuj .env i dodaj swój GitHub token jeśli potrzebujesz
```

### Uruchomienie lokalnie

```bash
# Uruchomienie serwera Jekyll
bundle exec jekyll serve

# Lub z live reload
bundle exec jekyll serve --livereload

# Serwer będzie dostępny na http://localhost:4000
```

### Build produkcyjny

```bash
# Build statycznych plików
bundle exec jekyll build

# Pliki będą w folderze _site/
```

### Zmienne środowiskowe

Aplikacja obsługuje następujące zmienne środowiskowe:

- `GITHUB_TOKEN` - GitHub Personal Access Token (opcjonalny)
  - Wymagany tylko dla prywatnych repozytoriów lub zwiększenia limitów API
  - Utwórz token na: https://github.com/settings/tokens
  - Wymagane uprawnienia: `repo` (dla prywatnych repozytoriów) lub `public_repo`

```bash
# Przykład użycia
export GITHUB_TOKEN="your_token_here"
bundle exec jekyll serve
```

## 🚀 Deployment

### Automatyczny (GitHub Actions)

Deployment automatycznie uruchamia się gdy:
- Nowy Issue zostanie utworzony/edytowany
- Kod zostanie wypchnięty na `main`
- Codziennie o 6:00 UTC (aby pobrać nowe Issues)

### Manualny

1. Przejdź do **Actions** w GitHub
2. Wybierz **"🚀 Manual Deploy to Azure Web App"**
3. Kliknij **"Run workflow"**
4. Wybierz parametry i uruchom

## ⚙️ Konfiguracja Azure

### Secrets w GitHub

Dodaj następujące secrets w ustawieniach repozytorium:

```bash
AZURE_CREDENTIALS={"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}
AZURE_WEBAPP_NAME=intellisent-blog
AZURE_RESOURCE_GROUP=intellisent-blog-rg
```

### Tworzenie zasobów Azure

```bash
# Utworzenie grupy zasobów
az group create --name intellisent-blog-rg --location "West Europe"

# Utworzenie App Service Plan
az appservice plan create --name intellisent-blog-plan --resource-group intellisent-blog-rg --sku FREE

# Utworzenie Web App
az webapp create --name intellisent-blog --resource-group intellisent-blog-rg --plan intellisent-blog-plan
```

## 📊 Struktura projektu

```
intellisent-blog/
├── .github/
│   ├── workflows/          # GitHub Actions
│   └── ISSUE_TEMPLATE/     # Szablony Issues
├── _layouts/               # Szablony Jekyll
├── _plugins/               # Plugin GitHub Issues
├── assets/
│   ├── css/               # Style
│   └── js/                # JavaScript
├── _config.yml            # Konfiguracja Jekyll
├── index.html             # Strona główna
├── 404.html              # Strona błędu
├── web.config            # Konfiguracja Azure
└── README.md             # Ten plik
```

## 🤝 Współpraca

1. Fork repozytorium
2. Utwórz branch dla zmian (`git checkout -b feature/amazing-feature`)
3. Commit zmian (`git commit -m 'Add amazing feature'`)
4. Push do brancha (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📞 Wsparcie

- **Issues**: [GitHub Issues](https://github.com/IntelliApp-pl/intellisent-blog/issues)
- **Email**: support@intelliapp.pl
- **Website**: [intellisent.net](https://intellisent.net)

## 📄 Licencja

MIT License - zobacz plik [LICENSE](LICENSE) dla szczegółów.

---

**Powered by**: Jekyll + GitHub Issues + Azure 🚀
