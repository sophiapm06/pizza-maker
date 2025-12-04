// Sophia's Pizza Game - Student Project
// TODO: Complete the functions below to make the game work!

// Some basic variables to get you started
let currentOrder = null;
let myToppings = [];

// Sample pizza orders - feel free to add more!
const orders = [
  {
    customer: "Alex",
    description: "I want cheese and olives, bake for 15 seconds!",
    toppings: ["cheese", "olive"],
    bakeTime: 15,
  },
  {
    customer: "Sam",
    description: "Pepperoni and mushrooms please, 12 seconds!",
    toppings: ["pepperoni", "mushroom"],
    bakeTime: 12,
  },
  // TODO: Add more orders here!
];

// Available toppings
const toppings = [
  "cheese",
  "pepperoni",
  "mushroom",
  "olive",
  "pepper",
  "onion",
];

// Getting HTML elements (this is done for you)
const playButton = document.getElementById("playBtn");
const startButton = document.getElementById("startBtn");
const bakeButton = document.getElementById("bakeBtn");

// TODO: Get more elements you need here
// const something = document.getElementById('...');

// Function to start the game
function startGame() {
  console.log("Game started!");
  // TODO: Hide welcome screen and show order screen
  // TODO: Load a new order
}

// Function to get a random order
function getRandomOrder() {
  console.log("Getting random order...");
  // TODO: Pick a random order from the orders array
  // HINT: Use Math.random() and Math.floor()
  return orders[0]; // This just returns the first one for now
}

// Function to show a new order to the player
function loadOrder() {
  console.log("Loading new order...");
  currentOrder = getRandomOrder();
  // TODO: Update the HTML to show customer name and description
  // TODO: Clear any previous feedback
}

// Function to start cooking (go to kitchen screen)
function startCooking() {
  console.log("Starting to cook!");
  // TODO: Hide order screen and show kitchen screen
  // TODO: Set up the topping buttons
  // TODO: Clear the pizza area
}

// Function to create topping buttons
function createToppingButtons() {
  console.log("Creating topping buttons...");
  // TODO: Loop through the toppings array
  // TODO: Create a button for each topping
  // TODO: Add click event to each button
}

// Function to add a topping to the pizza
function addTopping(toppingName) {
  console.log("Adding topping: " + toppingName);
  // TODO: Add the topping to myToppings array
  // TODO: Create a visual topping element on the pizza
  // TODO: Position it randomly on the pizza
}

// Function to clear all toppings from pizza
function clearPizza() {
  console.log("Clearing pizza...");
  // TODO: Empty the myToppings array
  // TODO: Remove all topping elements from pizza area
}

// Function to bake the pizza and check if it's correct
function bakePizza() {
  console.log("Baking pizza...");
  // TODO: Get the bake time from the slider
  // TODO: Check if toppings match the order
  // TODO: Check if bake time matches the order
  // TODO: Show success or failure message
  // TODO: Go back to order screen
}

// Function to check if the pizza is correct
function checkOrder() {
  console.log("Checking order...");
  // TODO: Compare myToppings with currentOrder.toppings
  // TODO: Compare bake time with currentOrder.bakeTime
  // TODO: Return true if both match, false otherwise
  return false; // Change this!
}

// Function to show different screens
function showScreen(screenName) {
  console.log("Showing screen: " + screenName);
  // TODO: Hide all screens
  // TODO: Show only the requested screen
}

// Function to update bake time display
function updateBakeTime() {
  console.log("Updating bake time display...");
  // TODO: Get value from bake time slider
  // TODO: Update the display text
}

// Event listeners (connecting buttons to functions)
playButton.addEventListener("click", startGame);
startButton.addEventListener("click", startCooking);
bakeButton.addEventListener("click", bakePizza);

// TODO: Add more event listeners for other buttons
// TODO: Add event listener for bake time slider

console.log("Pizza game loaded! Click Play to start.");
console.log("TODO: Complete all the functions to make the game work!");
