import { Link } from "react-router-dom";

//adding functionality to reset the quiz when we click on home-link
export default function Header({onHomeClick}) {
  return (
    <>
      <h1>Which Element Are You?</h1>
      <p>(Based on completely random things)</p>
      <nav>
        <Link to="/" onClick={onHomeClick}>Home</Link>
        <Link to="/quiz">Quiz</Link>
      </nav>
    </>
  );
}
