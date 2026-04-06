document.addEventListener('DOMContentLoaded', () => {
    //ADD CATEGORIES HERE
    const yellowCat = "NICKNAMES";
    const greenCat = "PRE DATING INSIDE JOKES";
    const blueCat = "WORDS FROM MOVIES WE'VE WATCHED";
    const purpleCat = "WORDS THAT SOUND SIMILAR TO ICONIC PLACES";

    //ADD WORDS HERE
    const yellowWords = ["DORY", "AMBRO", "PRINCESS", "CUTIE"];
    const greenWords = ["MONOLOGUE", "TIGHTROPE", "FORTUNE 500", "GODDESS"];
    const blueWords = ["GUN", "MAYBE", "FEELINGS", "ANYONE"];
    const purpleWords = ["SHOOT", "SEA SALT", "THEN", "TERRORIST"];

    const words = yellowWords.concat(greenWords, blueWords, purpleWords);
    const wordsContainer = document.getElementById('words-container');
    const categoryContainer = document.getElementById('category-container');
    const selectedWords = [];
    var correctAnswers = 0;
    var mistakesRemaining = 4;
    const mistakes = document.getElementById('mistakes');

    words.forEach(word => {
        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word');
        wordDiv.textContent = word;
        wordDiv.addEventListener('click', () => {
            if (wordDiv.classList.contains('selected')) {
                selectedWords.splice(selectedWords.indexOf(word), 1);
                wordDiv.classList.remove('selected');
                return;
            }
            if (selectedWords.length === 4) {
                return;
            }
            selectedWords.push(word);
            wordDiv.classList.toggle('selected');
        });
        wordsContainer.appendChild(wordDiv);
    });
    shuffleWords();

    document.getElementById('shuffle').addEventListener('click', shuffleWords);
    document.getElementById('deselect-all').addEventListener('click', deselectAll);
    document.getElementById('submit').addEventListener('click', submitAnswer);

    function shuffleWords() {
        const availableWords = Array.from(wordsContainer.children);
        availableWords.forEach(word => {
            if (word.id !== "") {
                availableWords.splice(availableWords.indexOf(word), 1);
            }
        });
        for (let i = 0; i < availableWords.length; i++) {
           let randomIndex = Math.floor(Math.random() * availableWords.length);
           let temp = availableWords[i];
            availableWords[i] = availableWords[randomIndex];
            availableWords[randomIndex] = temp;
        }
        wordsContainer.innerHTML = '';
        for (let i = 0; i < availableWords.length; i++) {
            wordsContainer.appendChild(availableWords[i]);
        }
    }

    function deselectAll() {
        document.querySelectorAll('.word.selected').forEach(word => {
            selectedWords.splice(selectedWords.indexOf(word.textContent), 1);
            word.classList.remove('selected');
        });
    }

    function submitAnswer() {
        if (selectedWords.length !== 4) {
            alert('Please select 4 words');
            return;
        }

        if (selectedWords.every(word => yellowWords.includes(word))) {
            makeCategory(yellowWords, yellowCat, "rgb(249, 223, 109)");
            correctAnswers++;
            return;
        }
        else if (selectedWords.every(word => greenWords.includes(word))) {
            makeCategory(greenWords, greenCat, "rgb(160, 195, 90)");
            correctAnswers++;
        }
        else if (selectedWords.every(word => blueWords.includes(word))) {
            makeCategory(blueWords, blueCat, "rgb(176, 196, 239)");
            correctAnswers++;
        }
        else if (selectedWords.every(word => purpleWords.includes(word))) {
            makeCategory(purpleWords, purpleCat, "rgb(186, 129, 197)");
            correctAnswers++;
        } else {
            wrongAnswer(selectedWords);
        }

        if (correctAnswers === 4) {
            alert('Congratulations. You win!');
        }

        if (mistakesRemaining === 0) {
            alert('You lose!');
            wordsContainer.innerHTML = '';
            categoryContainer.innerHTML = '';
            giveUpCategory(yellowWords, yellowCat, "rgb(249, 223, 109)");
            giveUpCategory(greenWords, greenCat, "rgb(160, 195, 90)");
            giveUpCategory(blueWords, blueCat, "rgb(176, 196, 239)");
            giveUpCategory(purpleWords, purpleCat, "rgb(186, 129, 197)");
        }
    }

    function wrongAnswer(words) {
        let shakers = Array.from(wordsContainer.children).filter(wordDiv => words.includes(wordDiv.textContent));
        shakers.forEach(wordDiv => {
            wordDiv.classList.add('shake');
            setTimeout(() => {
                wordDiv.classList.remove('shake');
            }, 500);
        });
        mistakesRemaining--;
        let s = '';
        for (let i = 0; i < mistakesRemaining; i++) {
            s += '•';
        }
        mistakes.textContent = s
    }

    function giveUpCategory(category, categoryName, categoryColor) {
        const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            categoryDiv.innerHTML = '<div><div class="category-name">' + categoryName + '</div>' + category.join(', ') + '</div>';
            categoryDiv.style.backgroundColor = categoryColor;
            categoryContainer.appendChild(categoryDiv);
    }

    function makeCategory(category, categoryName, categoryColor) {
        let movers = Array.from(wordsContainer.children).filter(wordDiv => category.includes(wordDiv.textContent));
        let toRemove = movers.slice();
        let targets = Array.from(wordsContainer.children).slice(0, 4);
        movers.forEach(wordDiv => {
            if (targets.includes(wordDiv)) {
                movers.splice(movers.indexOf(wordDiv), 1);
                targets.splice(targets.indexOf(wordDiv), 1);
            }
        });
        movers.forEach((wordDiv, i) => {
            const targetDiv = targets[i];
            const moveY = targetDiv.offsetTop - wordDiv.offsetTop;
            const moveX = targetDiv.offsetLeft - wordDiv.offsetLeft;
            wordDiv.style.transform = `translate(${moveX}px, ${moveY}px)`;
            targetDiv.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
        });
    
        let temp = Array.from(wordsContainer.children);
    
        setTimeout(() => {
            for (let i = 0; i < temp.length; i++) {
                if (toRemove.includes(temp[i])) {
                    temp.splice(i, 1);
                    i--;
                }
            }
            // Clear the wordsContainer
            wordsContainer.innerHTML = '';
        }, 1500);
    
        setTimeout(() => {
            // Reset all position-related styles before reappending
            temp.forEach(element => {
                element.style.transform = '';
                element.style.position = '';
                element.style.top = '';
                element.style.left = '';
            });

            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            categoryDiv.innerHTML = '<div><div class="category-name">' + categoryName + '</div>' + category.join(', ') + '</div>';
            categoryDiv.style.backgroundColor = categoryColor;
            categoryContainer.appendChild(categoryDiv);
    
            // Append the remaining elements back into the wordsContainer
            for (let i = 0; i < temp.length; i++) {
                wordsContainer.appendChild(temp[i]);
            }
        }, 1500);
    
        selectedWords.length = 0;
        selectedWords = [];
    }
});


