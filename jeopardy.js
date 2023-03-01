// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const JEOPARDY_URL = "http://jservice.io/";

let categories = [];
const WIDTH = 6;
const HEIGHT = 5;
let board = [];
let NUM_CATEGORIES = 6;
let NUM_CLUES_PER_CAT = 5;



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    
    const results = await axios({
        baseURL: JEOPARDY_URL,
        url: "api/categories",
        method: "GET",
        params: {
            count: 100,
        },
    });
    //console.log(results.data);
    const categoryIds = results.data.map(c => c.id);
    return _.sampleSize(categoryIds, NUM_CATEGORIES);
       
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios({
        baseURL: JEOPARDY_URL,
        url: "api/category",
        method: "GET",
        params: {
            id: catId,
        },
    });
    let cat = response.data;
    let allCLues = cat.clues;
    let randomClues = _.sampleSize(allCLues, NUM_CLUES_PER_CAT);
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    }));
    return {title: cat.title, clues}
  
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $gameBoard = $("#gameBoard");
    $("#gameBoard thead").empty();
    let $top = $('<tr>');
    $top.attr("id","column-top");
    
    for(let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++){
        let $headcell = $(`<th>`).text(categories[catIdx].title);
        $top.append($headcell);
    }
    $("#gameBoard thead").append($top);

    $("#gameBoard tbody").empty();
    for(let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++){
        const $row = $('<tr>');
        for(let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++){
            const $cell = $('<td>');
            $cell.attr('id', `${catIdx}-${clueIdx}`).text("?");
            $row.append($cell);
        }
        $("#gameBoard tbody").append($row);
    };
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id;
    let [catId,clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
    let message;

    if(!clue.showing){
        message = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question"){
        message = clue.answer;
        clue.showing = "answer";
    }else {
        return;
    };
        
    $(`#${catId}-${clueId}`).html(message);
    
};

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let catIds = await getCategoryIds();
    
    for (let catId of catIds){
        categories.push(await getCategory(catId));
    } 
    fillTable();

}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO


/**
 * Create an empty matrix array for our game ids
 */

// function makeBoard(){
//     for(let y = 0; y < HEIGHT; y++){
//         board.push(Array.from({length: WIDTH,}));
//     }
// };

/**
 * Create a table of html of our game board and set the ids for each cell 
 */

$("#restart").on('click', setupAndStart);

$(async function(){
    setupAndStart();
    $("#gameBoard").on('click', "td", handleClick)
});



