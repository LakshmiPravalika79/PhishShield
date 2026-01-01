# PhishShield

PhishShield is an advanced phishing detection platform leveraging AI and Google Cloud technologies to protect users from malicious websites and emails. The project is designed to provide real-time threat analysis and automated response to phishing attempts.

## Technologies Used

### Google Technologies
- **Firebase**: Used for authentication, real-time database, and hosting serverless functions.
- **Google Cloud Functions**: For backend logic and AI model inference.
- **Google Vision API**: For image analysis and detection of suspicious content.
- **Google Safe Browsing API**: To check URLs against Google's constantly updated list of unsafe web resources.

### Other Technologies
- **React**: Frontend framework for building the user interface.
- **Vite**: Fast build tool for modern web projects.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.

## About the Project

PhishShield aims to provide a seamless and secure experience for users by integrating AI-powered phishing detection with Google’s robust cloud infrastructure. The platform analyzes URLs, email content, and images using machine learning models and Google APIs to identify potential threats. When a phishing attempt is detected, users are notified instantly and guided on how to stay safe.

## AI Usage

- **Machine Learning Models**: Custom-trained models are used to classify URLs and email content as safe or suspicious.
- **Natural Language Processing (NLP)**: Analyzes email text and website content for phishing indicators.
- **Image Recognition**: Detects fake login pages and suspicious images using Google Vision API.
- **Continuous Learning**: The system improves over time by learning from new phishing techniques and user feedback.

## Usage

1. Sign up or log in using Firebase Authentication.
2. Submit a URL or email for analysis.
3. Receive instant feedback on the safety of the submitted content.
4. View detailed reports and recommendations.

## License

MIT
