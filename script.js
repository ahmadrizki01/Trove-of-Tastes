const categories = [
    'All', 'Breakfast', 'Main Course', 'Appetizer', 'Salad', 
    'Bread', 'Soup', 'Seafood', 'Chicken', 'Beef', 'Pork',
    'Vegetarian', 'Dessert', 'Pasta', 'Rice'
];
function createCategoryButtons() {
    const categoryContainer = document.getElementById('categoryButtons');
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn' + (category === 'All' ? ' active' : '');
        button.textContent = category;
        button.addEventListener('click', () => filterByCategory(category));
        categoryContainer.appendChild(button);
    });
}

function filterByCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === category) {
            btn.classList.add('active');
        }
    });
    if (category === 'All') {
        fetchRecipes();
    } else {
        fetchRecipesByCategory(category);
    }
}
document.getElementById('searchInput').addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.trim();
    if (searchTerm) {
        searchRecipes(searchTerm);
    } else {
        fetchRecipes();
    }
}, 300));
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
async function fetchRecipesByCategory(category) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error fetching recipes by category:', error);
    }
}
async function searchRecipes(searchTerm) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error searching recipes:', error);
    }
}
async function fetchRecipes() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}
function displayRecipes(meals) {
    const container = document.getElementById('recipesContainer');
    container.innerHTML = '';

    if (!meals) {
        container.innerHTML = '<p class="no-results">No recipes found</p>';
        return;
    }

    meals.forEach(meal => {
        const card = `
            <div class="recipe-card">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="recipe-info">
                    <h3>${meal.strMeal}</h3>
                    <p class="recipe-category">${meal.strCategory || ''}</p>
                    <button onclick="showRecipeDetails('${meal.idMeal}')" class="view-recipe-btn">
                       View Recipe
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

async function showRecipeDetails(mealId) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await response.json();
        const meal = data.meals[0];
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                ingredients.push({
                    ingredient: meal[`strIngredient${i}`],
                    measure: meal[`strMeasure${i}`]
                });
            }
        }
        const modalHtml = `
            <div class="recipe-modal" id="recipeModal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${meal.strMeal}</h2>
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <h3>Ingredients:</h3>
                    <ul>
                        ${ingredients.map(ing => `
                            <li>${ing.measure} ${ing.ingredient}</li>
                        `).join('')}
                    </ul>
                    <h3>How to make:</h3>
                    <p>${meal.strInstructions}</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('recipeModal');
        const closeBtn = modal.querySelector('.close-modal');
        
        closeBtn.onclick = function() {
            modal.remove();
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        }
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}
document.addEventListener('DOMContentLoaded', createCategoryButtons);
