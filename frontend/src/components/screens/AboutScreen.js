import React from 'react';
import { Container, Image } from 'react-bootstrap';

function AboutScreen() {
  const defaultImage = process.env.PUBLIC_URL + '/images/playstation.jpg';

  return (
    <div>
      {/* Image Section */}
      <Image src={defaultImage} fluid style={{ width: '100%', height: '80vh', objectFit: 'cover' }} />
      
      {/* Text Content Section */}
      <Container className="mt-4">
        <p>In recent times, there has been a notable surge in individuals desiring to establish their own online stores and sell personal products. However, many of them face significant challenges, particularly in understanding how to start and in attracting the right customer base. To address this challenge, our project proposes the development of an innovative web application designed to assist individuals in launching and growing their e-commerce businesses. As for its category, it will be an application in an established area.</p>

        <p>The web application will be developed using the Django framework. The core functionality of our web application revolves around a sophisticated recommendation system. Utilizing machine learning algorithms, such as collaborative filtering, our system aims to match the right products with the right customers, thereby enhancing the purchase rate and aiding business growth for our users. This technology will be powered by user input data collected through a custom-built collector API, with data being securely stored in a cloud-based database.</p>

        <p>Our product gives the user the ability to jumpstart their e-commerce ventures with minimal initial investment, tapping into a market that was previously challenging to access.</p>

        <p>Furthermore, we expect that the project will be an enriching learning experience for our team. It offers an opportunity to deepen our understanding of the Software Development Life Cycle and Agile development methodologies. And through this project, we anticipate enhancing our skills in both front-end and back-end development. More importantly, it provides a practical platform to apply machine learning algorithms in solving real-world problems.</p>

        <p>In summary, our project not only aims to empower emerging e-commerce entrepreneurs but also serves as an opportunity for our team's growth in various domains of software development and machine learning application.</p>
      </Container>
    </div>
  );
}

export default AboutScreen;
