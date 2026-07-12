let count = 0;
let completedTaskIds = [];
let inputContent = document.getElementById("input");

const submitButton = document.getElementById("submit");
const listElement = document.getElementById("ul");
const deleteDone = document.getElementById("deleteDone");

function validateNewTask(input) {
    if (typeof input !== "string") {
        return "Input is not a string";
    }

    if (input.length < 1) {
        return "Input field cannot be left empty";
    }

    if (input.trim().length == 0) {
        return "Input cannot only be whitespace"
    }

    return true;
}

function addToList(newListItemContent) {
    const list = document.getElementById("ul");

    // inserts inside of the ul component
    list.insertAdjacentHTML('beforeend', 
        `<li id=\"item${count}\">
            <label for=\"task${count}\" id=\"label${count}\">
                <input type=\"checkbox\" id=\"task${count}\" name=\"checklist\" value=\"1\">
                    ${newListItemContent}
                <input type=\"button\" id=\"delete${count}\" value=\"Delete\">
            </label>
        </li>`
    );
}

function removeFromList(listItemNumber) {
    const listItem = document.getElementById(`item${listItemNumber}`);
    listItem.remove();
}

function strikeThroughItem(listItemNumber) {
    const labelItem = document.getElementById(`label${listItemNumber}`);
    const taskItem = document.getElementById(`task${listItemNumber}`);
    const text = labelItem.textContent;
    let newText;

    if (taskItem.checked) {
        newText = `<del>${text}</del>`;

        // add a completed task to list of completed tasks
        completedTaskIds.push(`item${listItemNumber}`);

        // put 'checked' here to force item to be checked
        labelItem.innerHTML = `
        <input type=\"checkbox\" id=\"task${listItemNumber}\" name=\"checklist\" value=\"1\" checked>
            ${newText}
        <input type=\"button\" id=\"delete${listItemNumber}\" value=\"Delete\">
        `;
    } else {
        newText = `${text}`;

        // remove a unchecked task from the completed task list
        const indexOfUncheckedItem = completedTaskIds.indexOf(`item${listItemNumber}`);
        if (indexOfUncheckedItem > -1) {
            completedTaskIds.splice(indexOfUncheckedItem, 1);
        }

        labelItem.innerHTML = `
        <input type=\"checkbox\" id=\"task${listItemNumber}\" name=\"checklist\" value=\"1\">
            ${newText}
        <input type=\"button\" id=\"delete${listItemNumber}\" value=\"Delete\">
        `;
    }
}

function removeAllCompleted() {
    const idsLength = completedTaskIds.length;

    let listItem;
    let indexOfUncheckedItem;

    // move backwards to not mess up indexing
    for (let i = idsLength - 1; i >= 0; i--) {
        listItem = document.getElementById(`${completedTaskIds[i]}`);
        listItem.remove();
        indexOfUncheckedItem = completedTaskIds.indexOf(`${completedTaskIds[i]}`);

        if (indexOfUncheckedItem > -1) {
            completedTaskIds.splice(indexOfUncheckedItem, 1);
        }
    }

    count -= idsLength;
}

function updateAgendaCount() {
    const agenda = document.getElementById("agenda");
    agenda.innerHTML = `Total Items Left On The Agenda: ${count}`;
}

// Handles pressing the submit button
submitButton.addEventListener("click", function(event) {
    event.preventDefault();
    let input = inputContent.value;
    let validateResult = validateNewTask(input);

    if (validateResult === true) {
        count++;
        addToList(inputContent.value);
        updateAgendaCount();
        inputContent.value = "";
        return;
    } else {
        alert(validateResult);
        return;
    }
});

// Handles pressing the remove button on list item
listElement.addEventListener("click", function(event) {
    const button = event.target.id;
    
    // Delete button handling
    if (button.substring(0,5) != "label" && button.substring(0,4) != "task" && button.substring(0,4) != "item" && button.length != 0) {
        const itemNumber = button.substring(6);
        count--;
        removeFromList(itemNumber);
        updateAgendaCount();
        return;
    }

    // Checkbox handling
    if (button.substring(0,5) != "label" && button.substring(0,5) != "delete" && button.substring(0,4) != "item" && button.length != 0) {
        const itemNumber = button.substring(4);
        strikeThroughItem(itemNumber);
        return;
    }
});

// Handles removing all completed tasks
deleteDone.addEventListener("click", function(event){
    removeAllCompleted();
    updateAgendaCount();
    return;
});