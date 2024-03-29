# AI-Powered E-Commerce App Django

![Django CI](https://github.com/ECE651Group16/AI-Powered-E-Commerce-App/actions/workflows/django.yml/badge.svg?branch=main) ![Node CI](https://github.com/ECE651Group16/AI-Powered-E-Commerce-App/actions/workflows/react.yml/badge.svg?branch=main) 

An AI-enhanced e-commerce platform designed to offer an intuitive and efficient online shopping experience. Developed
with Django and backed by MySQL, this app integrates advanced AI features to cater to both user and business needs.

## 🚀 Getting Started

This project is divided into two main parts: the backend, developed using Django, and the frontend, developed using
React. Below you will find instructions to set up each part of the project.

### Backend Setup

The backend code is stored in the `Backend/` directory. Here's how to get started with it:

1. **Navigate to the Backend Directory**

```bash
cd Backend/
```

2. **Install Dependencies**
   Ensure you have Python 3.10 and Pipenv installed. Then, install the required packages:

```bash
pipenv install
```

3. **Activate the Virtual Environment**

```bash
pipenv shell
```

4. **Setup the Database**
   Make sure MySQL is installed and running. Update the settings.py file with your database credentials, then execute:

```bash
python manage.py migrate
```

5. **Run the Development Server**

```bash
python manage.py runserver
```

### Frontend Setup

The frontend code is stored in the Frontend/ directory and is built using React. Follow these steps to set up the
frontend:

1. **Navigate to the Frontend Directory**

```bash
cd Frontend/
```

2. **Install Node.js and npm**
   Make sure you have Node.js and npm installed on your machine.
   3.**Install Dependencies**
   ```bash
   npm install
   ```

4.**Start the Development Server**

```bash
npm start
```

After following these steps, the backend server will be running, and you can access the frontend application in your
browser.

## 📚 Documentation

For more detailed documentation on Django,
visit [Django's official documentation](https://docs.djangoproject.com/en/3.2/).
For React and how to work with it, check
out [React's official documentation](https://reactjs.org/docs/getting-started.html).

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any
contributions you make are greatly appreciated. See [CONTRIBUTING](CONTRIBUTING.md) for more information.

## 📝 License

Distributed under the Apache License Version 2.0 License. See [LICENSE](LICENSE) for more information.

## 📩 Contact

Project Link: https://github.com/ECE651Group16/AI-Powered-E-Commerce-App

