import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./components/Header.jsx";
import { UserProvider } from "./components/UserContext.jsx";
import UserForm from "./components/UserForm.jsx";
import Question from "./components/Question.jsx";
import Results from "./components/Results.jsx";

const questions = [
  {
    question: "What's your favorite season?",
    options: ["Red 🔴", "Blue 🔵", "Green 🟢", "Yellow 🟡"],
  },
  {
    question: "What's your favorite season?",
    options: ["Summer", "Fall", "Spring", "Winter"],
  },

  {
    question: "What's your favorite food?",
    options: ["Pizza", "Pancakes", "Burger", "Soup"],
  },
];

const keywords = {
  Fire: "fire",
  Water: "water",
  Earth: "earth",
  Air: "air",
};

const elements = {
  "Red 🔴": "Fire",
  "Blue 🔵": "Water",
  "Green 🟢": "Earth",
  "Yellow 🟡": "Air",

  Summer: "Fire",
  Fall: "Earth",
  Spring: "Air",
  Winter: "Water",

  Pizza: "Fire",
  Pancakes: "Earth",
  Burger: "Air",
  Soup: "Water",

  // Continue mapping all your possible options to a keyword
};

function App() {
  //state def
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userName, setUserName] = useState("");
  const [element, setElement] = useState("");
  const [artwork, setArtWork] = useState(null);

  //adding loading state
  const [isLoading, setIsLoading] = useState(false);

  //adding a function to reset the quiz, calling it when we submit a name, so that we can retake it without the same results showing
  function resetQuiz(){
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setElement("");
    setArtWork(null);
  }

  //handler functions
  function handleAnswer(answer) {
    setAnswers([...answers, answer]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  function handleUserFormSubmit(name) {
    resetQuiz(); //reset when a new name is submitted
    setUserName(name);
  }

  function determineElement(answers) {
    const counts = {};
    answers.forEach(function (answer) {
      const element = elements[answer];
      counts[element] = (counts[element] || 0) + 1;
    });
    return Object.keys(counts).reduce(function (a, b) {
      return counts[a] > counts[b] ? a : b;
    });
  }

  //Datafetching
  async function fetchArtwork(keyword) {
    setIsLoading(true); //starting to load
    try {
      //getting the images that matches the keyword
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=${keyword}&hasImages=true&limit=12`,
      );
      if (response.ok === false) {
        throw new Error("faild to fetch");
      }
      const data = await response.json();

      //check if we got any matches
      if (!data.objectIDs || data.objectIDs.length === 0) {
        throw new Error("Did not find any artworks 😞");
      }

      //Getting the 3 first
      const ids = data.objectIDs;

      //creating a list of Promises
      const artworkPromises = ids.map(async (objectID) => {
        try {
          const artResponse = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`,
          );

          if (artResponse.ok) {
            const artData = await artResponse.json();

            //check if there is an image
            if (artData.primaryImage && artData.primaryImage !== "") {
              return artData; //found valid artwork.
            }
          }
        } catch (err) {
          //ignore network issues if the id is broken
        }
        return null;
      });

      //wait until all requests are done
      const results = await Promise.all(artworkPromises);

      //getting the first that is not null
      const validArtwork = results.find((art) => art !== null);

      if (validArtwork) {
        setArtWork(validArtwork);
      } else {
        console.log("No valid artworks");
      }
    } catch (error) {
      console.log(error.message);
    } finally{
      setIsLoading(false); //changing loading state to false
    }
  }

  //useEffect
  useEffect(
    function () {
      if (currentQuestionIndex === questions.length) {
        const selectedElement = determineElement(answers);
        setElement(selectedElement);
        fetchArtwork(keywords[selectedElement]);
      }
    },
    [currentQuestionIndex],
  );

  return (
    <UserProvider value={{ name: userName, setName: setUserName }}>
      <div>
        <Header onHomeClick={resetQuiz}/>
        <Routes>
          <Route
            path="/"
            element={<UserForm onSubmit={handleUserFormSubmit} />}
          />
          <Route
            path="/quiz"
            element={
              currentQuestionIndex < questions.length ? (
                <Question
                  question={questions[currentQuestionIndex].question}
                  options={questions[currentQuestionIndex].options}
                  onAnswer={handleAnswer}
                />
              ) : (
                <Results element={element} artwork={artwork} isLoading={isLoading}/>
              )
            }
          />
        </Routes>
      </div>
    </UserProvider>
  );
}
export default App;
