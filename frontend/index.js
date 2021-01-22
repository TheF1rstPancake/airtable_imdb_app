import { initializeBlock } from "@airtable/blocks/ui";
import { Input, Button, ConfirmationDialog } from "@airtable/blocks/ui";
import { base } from "@airtable/blocks";

import React, { useState } from "react";
import axios from "axios";

const pillStyle = {
  backgroundColor: "transparent",
  marginTop: "10px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "3px",
  cursor: "pointer",
  transition: "box-shadow 0.15s ease-out 0s",
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 0px 2px",
  backgroundColor: "rgb(255, 255, 255)",
};

const dataStyle = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
};

// hardcoding our API key because:
//  1. it's not sensitive in this context
//  2. makes it easier to push out to demos
const API_KEY = "k_hLIbwroi";
async function searchIMDBData(apikey, search_term) {
  const url = `https://imdb-api.com/en/API/Search/${apikey}/${search_term}`;
  const response = await axios.get(url);
  return response.data;
}

async function searchTitle(apikey, title_id) {
  const url = `https://imdb-api.com/en/API/Title/${apikey}/${title_id}`;
  const response = await axios.get(url);
  return response.data;
}

async function writeTitleToBase(table, fullTitle) {
  var r = await table.createRecordAsync({
    title: fullTitle.fullTitle,
    imdb_id: fullTitle.id,
    original_title: fullTitle.originalTitle,
    overview: fullTitle.plot,
    release_date: fullTitle.releaseDate,
    runtime: parseInt(fullTitle.runtimeMins),
    revenue: parseInt(
      fullTitle.boxOffice.cumulativeWorldwideGross.replace(/[$,]/g, "")
    ),
    vote_count: parseInt(fullTitle.imDbRatingVotes),
  });
  console.log(r);
}

function TitleCard(props) {
  return (
    <div
      style={pillStyle}
      onClick={() => {
        return props.onClick(props.id);
      }}
    >
      <div>
        <h3> {props.title} </h3>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div style={dataStyle}>
          <div>
            <div>
              <p> Image </p>
            </div>
            <div>
              <img src={props.image} width={80} />
            </div>
          </div>
        </div>
        <div style={dataStyle}>
          <div>
            <div>
              <p> Result Type </p>
            </div>
            <div>
              <p> {props.resultType} </p>
            </div>
          </div>
        </div>
        <div style={dataStyle}>
          <div>
            <div>
              <p> Description </p>
            </div>
            <div>
              <p> {props.description} </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HelloWorldBlock() {
  const [titles, setTitles] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setSearching] = useState(false);
  const [fullTitle, setFullTitle] = useState(null);
  const [showFullTitle, setShowFullTitle] = useState(false);

  // get our table
  const table = base.getTable("Movies");

  const fetchFullTitle = async (title_id) => {
    const title = await searchTitle(API_KEY, title_id);

    setFullTitle(title);
    setShowFullTitle(true);
  };

  return (
    <div>
      <h1> IMDB </h1>
      <div
        style={{
          display: "flex",
          margin: "10px",
        }}
      >
        <div
          style={{
            flexGrow: 8,
          }}
        >
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search IMDB"
          />
        </div>
        <div
          style={{
            flexGrow: 1,
            marginLeft: "10px",
          }}
        >
          <Button
            onClick={async () => {
              setSearching(true);

              const results = await searchIMDBData(API_KEY, searchTerm);
              setTitles(results);

              setSearching(false);
            }}
            disabled={isSearching}
          >
            Search
          </Button>
        </div>
      </div>
      {titles === null ? null : (
        <div
          style={{
            margin: "10px",
            padding: "5px",
            border: "2px solid rgba(0,0,0,0.1)",
          }}
        >
          {titles.results.map((t) => {
            t.onClick = fetchFullTitle;
            return <div key={t.id}> {TitleCard(t)} </div>;
          })}
        </div>
      )}
      {showFullTitle === true && (
        <ConfirmationDialog
          title={fullTitle.fullTitle}
          body="Would you like to add this record to your base?"
          onConfirm={async () => {
            await writeTitleToBase(table, fullTitle);
            setShowFullTitle(false);
          }}
          onCancel={() => setShowFullTitle(false)}
        />
      )}
    </div>
  );
}

initializeBlock(() => <HelloWorldBlock />);
