// globals
let count = 0;
let completedTaskIds = [];
let completedTaskItemsRemoved = 0;
let inputContent = document.getElementById("input");

// element references
const submitButton = document.getElementById("submit");
const listElement = document.getElementById("ul");
const deleteDone = document.getElementById("deleteDone");

// backend connections
async function fetchAllTodos() {
    const res = await fetch(`http://localhost:3000/todos`);
    const data = await res.json();
    return data;
}

async function createTodo(task) {
    const res = await fetch(`http://localhost:3000/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, completed: false })
    });

    return await res.json();
}

async function deleteTodo(id) {
    const res = await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE'
    });

    return res.status === 204;
}

async function updateTodo(id, completed) {
    const res = await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: completed })
    });

    return res.status === 200;
}

async function deleteAllCompletedTodo() {
    const completedTasksLength = completedTaskIds.length;

    for (let i = completedTasksLength - 1; i >= 0; i--) {
        let taskId = completedTaskIds[i].substring(4);
        let res = await deleteTodo(taskId);

        if (res !== true) {
            console.log(`Error: Issues deleting all completed tasks, at id ${taskId}`);
            return false;
        }

        completedTaskItemsRemoved++;
    }

    return true;
}

// helpers
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

function addToList(id, newListItemContent) {
    const list = document.getElementById("ul");

    // inserts inside of the ul component
    list.insertAdjacentHTML('beforeend', 
        `<li id=\"item${id}\">
            <label for=\"task${id}\" id=\"label${id}\">
                <input type=\"checkbox\" id=\"task${id}\" name=\"checklist\" value=\"1\">
                    ${newListItemContent}
                <input type=\"button\" id=\"delete${id}\" value=\"Delete\">
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

function removeAllCompleted(limit) {
    const idsLength = completedTaskIds.length;

    let listItem;
    let indexOfUncheckedItem;

    // move backwards to not mess up indexing
    for (let i = idsLength - 1; i >= idsLength - limit; i--) {
        listItem = document.getElementById(`${completedTaskIds[i]}`);
        listItem.remove();
        indexOfUncheckedItem = completedTaskIds.indexOf(`${completedTaskIds[i]}`);

        if (indexOfUncheckedItem > -1) {
            completedTaskIds.splice(indexOfUncheckedItem, 1);
        }
    }

    count -= limit;
}

function updateAgendaCount() {
    const agenda = document.getElementById("agenda");
    agenda.innerHTML = `Total Items Left On The Agenda: ${count}`;
}

// DOM manipulation
// Handles pressing the submit button
submitButton.addEventListener("click", async function(event) {
    event.preventDefault();
    let input = inputContent.value;
    let validateResult = validateNewTask(input);

    if (validateResult === true) {
        count++;
        const task = await createTodo(inputContent.value);
        addToList(task.id, task.task);
        updateAgendaCount();
        inputContent.value = "";
        return;
    } else {
        alert(validateResult);
        return;
    }
});

// Handles pressing the remove button and checkbox on list item
listElement.addEventListener("click", async function(event) {
    const button = event.target.id;
    
    // Delete button handling
    if (button.substring(0,5) != "label" && button.substring(0,4) != "task" && button.substring(0,4) != "item" && button.length != 0) {
        const itemNumber = button.substring(6);
        
        const response = await deleteTodo(itemNumber);
        if (response !== true) {
            console.log(`Error: Issue deleting task id ${itemNumber}`);
            return;
        } else {
            removeFromList(itemNumber);
        }
        
        count--;
        updateAgendaCount();
        return;
    }

    // Checkbox handling
    if (button.substring(0,5) != "label" && button.substring(0,5) != "delete" && button.substring(0,4) != "item" && button.length != 0) {
        const itemNumber = button.substring(4);
        const taskItem = document.getElementById(`task${itemNumber}`);

        const response = await updateTodo(itemNumber, taskItem.checked);
        if (response !== true) {
            console.log(`Error: Issue with updating item ${itemNumber}`);
            taskItem.checked = !taskItem.checked;
            return;
        } else {
            strikeThroughItem(itemNumber);
        }

        return;
    }
});

// Handles removing all completed tasks
deleteDone.addEventListener("click", async function(event){
    const res = await deleteAllCompletedTodo();
    removeAllCompleted(completedTaskItemsRemoved);

    updateAgendaCount();

    completedTaskItemsRemoved = 0;

    return;
});

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchAllTodos();

    for (const {id, task, completed} of data) {
        addToList(id, task);
        count++;
        
        if (completed === true) {
            const taskItem = document.getElementById(`task${id}`);
            taskItem.checked = true;

            strikeThroughItem(id);
        }
    }

    updateAgendaCount();
});