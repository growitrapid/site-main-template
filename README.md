
<p align="center">
    <a href="https://www.growitrapid.com/">
        <picture>
            <source media="(prefers-color-scheme: dark) and (min-height: 600px)" srcset="https://www.growitrapid.com/_next/static/media/logo_dark.160d8e6c.svg"/>
            <source media="(prefers-color-scheme: light)" srcset="https://www.growitrapid.com/_next/static/media/logo_light.ea6645ec.svg"/>
            <img
                alt="GrowItRapid"
                width="300"
                height="60"
            />
        </picture>
    </a>
</p>


<h1 align="center">
    Frontend Website Template for GrowItRapid
</h1>

<p align="center">
    Welcome to the Frontend Website Template repository for GrowITRapid. This template is designed to kickstart development of this projects with ease. Below, you'll find all the information you need to get started.
</p>

<h2>
    Key Features
</h2>

* **Responsive Design**: Ensure the website looks great on all devices, from desktops to mobiles.
* **Modern Frameworks**: Built with the latest web technologies and frameworks to ensure high performance and maintainability.
* **Customizable Styles**: Easily modify the template's styles to match the brand's look and feel.
* **Optimized Performance**: Prioritized performance optimization for a seamless user experience.
* **Reusable Components**: Includes a library of reusable components to speed up development.
* **Documentation**: Detailed documentation to guide through every aspect of the template.

## Installation

1. Clone the repository:

```shell
git clone https://github.com/growitrapid/site-main-template
```

2. Navigate to the project folder:

```shell
cd site-main-template
```

3. Install dependencies:

```shell
npm install
```

4. Rename the `.env.example` file to `.env` and update the environment variables:
5. Setup the database: (This will also add some mock data in the database):

```shell
$env:MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.bpoiuyt.mongodb.net/?retryWrites=true&w=majority"

npm run setup-db
```
6. Start the development server:

```shell
npm run dev
```

## Contributing

We welcome contributions from the community. If you'd like to improve this template, please follow these guidelines:

<ol>
    <li>
        Fork the repository.
    </li>
    <li>
        Create a new branch for your feature or bug fix:
        <pre lang="shell">git checkout -b feature/your-feature</pre>
    </li>
    <li>
        Make your changes and commit them:
        <pre lang="shell">git commit -m 'Added a new feature'</pre>
    </li>
    <li>
        Push to your fork and submit a pull request.
        <pre lang="shell">git push origin feature/your-feature</pre>
    </li>
</ol>

We'll review your contribution as soon as possible.

## Rules and Guidelines

Please make sure to follow these rules and guidelines when contributing to this project:

1. Make sure your code is well documented, commented & well tested.
2. Make sure your code follows the project's coding style.
3. Ensure the website's layout is responsive and looks great on all devices.
4. Mentain the brand's look and feel when modifying the template's styles.
5. **This project uses the server actions & all function are located in the `/src/functions` folder. Don't make any changes in that directory. If you feel the necessity for any changes, inform us. We will update it, if necessary.**
6. **Don't touch the `/src/app/api/auth/[...nextauth]` directory.**

## License

This project is licensed under the MIT License. For more details, please see the [LICENSE](https://choosealicense.com/licenses/mit/) file.

