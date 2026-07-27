GitHub Pages deployment package

Use this folder or zip for a GitHub Pages repository.

Recommended:
1. Create a public GitHub repository.
2. Upload all files from this folder to the repository root.
3. In GitHub repository settings, open Pages.
4. Set Source to "Deploy from a branch".
5. Select branch "main" and folder "/ (root)".
6. Save and wait for the site to publish.

Custom domain:
- The CNAME file is already included for tanyapozharova.ru
- In GitHub Pages settings, also set the custom domain to tanyapozharova.ru

DNS for apex domain:
- A @ -> 185.199.108.153
- A @ -> 185.199.109.153
- A @ -> 185.199.110.153
- A @ -> 185.199.111.153

DNS for www:
- CNAME www -> <your-github-username>.github.io
