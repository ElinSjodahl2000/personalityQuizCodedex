import React, { useContext } from "react";
import { UserContext } from "./UserContext";

export default function Results({ element, artwork, isLoading }) {
  // reference the context for the "name".
  const { name, setName } = useContext(UserContext);

  if (isLoading) {
    return (
      <div>
        <p>
          <strong>{name}</strong>, your element is: {element}
        </p>
        <p>Loading artwork...</p>
      </div>
    );
  } else {
    return (
      <div>
        <p>
          <strong>{name}</strong>, your element is: {element}
        </p>
        {artwork ? (
          <div className="artwork">
            <h2>{artwork.title}</h2>
            <img src={artwork.primaryImage} alt={artwork.title} />
            <p>{artwork.artistDisplayName}</p>
            <p>{artwork.objectDate}</p>
          </div>
        ) : (
          <p>No artwork found.</p>
        )}
      </div>
    );
  }
}
