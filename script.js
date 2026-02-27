// DOCUMENTATION
// These JSDoc definitions are not fully compatible with VSCode but can still be partly used by hovering over the "type" definition over a variable
// Unfortunately, this requires manually updating the documentation if the variable names are changed
// This is a limitation of the JSDoc system and the way it is implemented in VSCode

// Options object
/**
 * Configuration options for generating a weekly table.
 * @typedef {Object} Options
 * @property {string} StartingDate - The starting date input for the schedule.
 * @property {string} EndingDate - The ending date input for the schedule.
 * @property {string} DateLocale - The locale used for formatting dates.
 * @property {string} TimePeriod - The display format for the time period.
 * @property {boolean} SidedWeekNumberingLeft - Whether to display the week number on the left side; otherwise right side.
 * @property {number} Dose - The initial dose value.
 * @property {number} DoseIncrement - The amount by which the dose is incremented.
 * @property {number} DoseIncrementTimes - The number of times the dose is incremented.
 * @property {number} DosePeriod - The period over which the dose is administered.
 * @property {Date} StartDate - The parsed starting date object.
 * @property {Date} EndDate - The parsed ending date object.
 * @property {string} Title - The title text for the table.
 * @property {boolean} FooterEnabled - Whether the footer text is enabled.
 * @property {string} FooterText - The freeform text for the footer.
 */
// DateFormat object
/**
 * Configuration options for date formatting.
 * @typedef {Object} DateFormat
 * @property {string} Short - Short date format.
 * @property {string} ShortMonth - Short date format with month.
 * @property {string} Long - Long date format.
 * @property {string} Weekday - Weekday format.
 */

// INIT
//  Set default date to today
document.getElementById("start-date").value = new Date().toISOString().split("T")[0];
document.getElementById("end-date").value = new Date().toISOString().split("T")[0];

// EVENTS
//  TIME PERIOD
function timePeriodOptionChanged() {
    const timePeriodOption = document.getElementById("timeperiod-options").value;
    let weekSideHTML = [document.getElementById("timeperiod-sidedweek-side-label"), document.getElementById("timeperiod-sidedweek-side")];
    let customLabelHTML = [document.getElementById("timeperiod-customlabel-label"), document.getElementById("timeperiod-customlabel")];

    // Hide the week side bool checkbox
    weekSideHTML.forEach((element) => {
        element.style.display = "none";
    });
    // Hide the custom label input
    customLabelHTML.forEach((element) => {
        element.style.display = "none";
    });

    if (timePeriodOption == "sidedweeknumber") {
        // Show the week side bool checkbox
        weekSideHTML.forEach((element) => {
            element.style.display = "inline";
        });
    }
    if (timePeriodOption == "custom") {
        // Show the custom label input
        customLabelHTML.forEach((element) => {
            element.style.display = "inline";
        });
    }
}

// GENERATORS
//  WEEKLY TABLE
function generateWeeklyTables(optionsObject) {
    //function generateWeeklyTables(startDate, endDate, dateLocale, weeklyDisplay, dose, doseIncrement, doseIncrementTimes, dosePeriod) {
    //console.log(startDate,endDate,dateLocale,dose,doseIncrement,doseIncrementTimes,dosePeriod);

    const debug = true;
    // debug logging of parsed object values
    if (debug) {
        Object.keys(optionsObject).forEach((key) => {
            console.log(`${key}: ${optionsObject[key]}`);
        });
    }

    // deliberate redundancy to separate arg from parsed
    /** @type {Options} */
    const options = optionsObject;

    const container = document.getElementById("table-container");

    /** @type {DateFormat} */
    const dateFormat = {
        Short: { day: "numeric" },
        ShortMonth: { day: "numeric", month: "short" },
        Long: { year: "numeric", month: "long", day: "numeric" },
        Weekday: { weekday: "long" },
    };

    // const dateShort = {day:"numeric"};
    // const dateShortMonth = {day:"numeric",month:"short"};
    // const dateLong = {year:"numeric",month:"long",day:"numeric"};
    // const dateWeekday = {weekday:"long"};
    container.innerHTML = ""; // Clear previous tables
    let currentDate = new Date(options.StartingDate);

    let table = document.createElement("table"); // The original script had this inside the while to make separate tables for each week

    // Make a weekday header before anything else
    let weekdays = document.createElement("thead");
    weekdays.id = "thead-weekdays";
    let weekdayRow = document.createElement("tr");
    let workingday = new Date();

    let isFirstDayCreated = false;
    let tableSpan = 7;
    let periodindicatorDisplayed = false;
    let periodindicatorCounter = 0;

    // Update main title
    const mainTitle = document.getElementById("main-title");
    if (mainTitle) {
        mainTitle.textContent = options.Title || "Medication Schedule";
    }

    if (options.TimePeriod == "sidedweeknumber") {
        periodindicatorDisplayed = true;
        tableSpan = 8;
    }

    // Header
    if (periodindicatorDisplayed && options.SidedWeekNumberingLeft) {
        console.log("sidedleft");
        weekIndicatorInjection(weekdayRow);
    }
    for (let i = 0; i < 7; i++) {
        let weekdayCell = document.createElement("th");
        workingday.setDate(currentDate.getDate() + i);
        weekdayCell.textContent = `${workingday.toLocaleDateString(options.DateLocale, dateFormat.Weekday)}`;
        weekdayCell.className = "td-weekday";
        weekdayRow.appendChild(weekdayCell);
        weekdays.appendChild(weekdayRow);
        if (i == 6 && periodindicatorDisplayed && !options.SidedWeekNumberingLeft) {
            console.log("sidedright");
            weekIndicatorInjection(weekdayRow);
        }
    }

    table.appendChild(weekdays);

    // Building the table
    // Dose iterators
    let doseCounter = 0;
    let doseIteration = 0;

    while (currentDate <= options.EndDate) {
        // If the time period is set to "weekstarting", display the week starting date as a header row
        if (options.TimePeriod == "weekstarting" || options.TimePeriod == "custom") {
            let _option = options.TimePeriod == "weekstarting" ? 0 : options.TimePeriod == "custom" ? document.getElementById("timeperiod-customlabel").value : "Error";

            // For "custom", only add it once at the very beginning of the table
            if (options.TimePeriod == "custom" && table.querySelector(".header-custom-period")) {
                // Already added, skip
            } else {
                let thead = document.createElement("thead"); //header
                let headerRow = document.createElement("tr"); //header row
                let headerCell = document.createElement("th"); //header cell
                headerCell.colSpan = tableSpan; // Use tableSpan to account for week numbers
                if (_option == 0) {
                    headerCell.textContent = `Week Starting: ${currentDate.toLocaleDateString(options.DateLocale, dateFormat.Long)}`;
                } else {
                    headerCell.textContent = _option;
                    headerCell.className = "header-custom-period";
                }
                headerCell.classList.add("header-week-outline");
                headerRow.appendChild(headerCell);
                thead.appendChild(headerRow);
                table.appendChild(thead);
            }
        }

        let doseClass = "dose-0"; // currently unused

        // Table Body (Days)
        let tbody = document.createElement("tbody");
        let row = document.createElement("tr");

        if (periodindicatorDisplayed && options.SidedWeekNumberingLeft) {
            console.log("sidedleft");
            periodindicatorCounter++;
            weekValueInjection(periodindicatorCounter, row);
        }
        for (let i = 0; i < 7; i++) {
            if (doseCounter >= options.DosePeriod) {
                if (doseIteration < options.DoseIncrementTimes) {
                    doseIteration++;
                }
                doseCounter = 0;
                //doseClass = "dose-" + doseIteration.toString();
            }

            let determinedDose = Number(options.Dose) + Number(options.DoseIncrement) * Number(doseIteration);

            if (debug) {
                console.log(determinedDose);
                console.log(options.Dose, options.DoseIncrement, doseIteration);
            }

            let cell = document.createElement("td");
            if (currentDate.getDate() === 1) {
                cell.textContent = currentDate.toLocaleDateString(options.DateLocale, dateFormat.ShortMonth);
            } else {
                cell.textContent = currentDate.toLocaleDateString(options.DateLocale, dateFormat.Short);
            }
            let doseIcon = document.createElement("span");
            // Only add dosage text if there actually is a dose specified
            if (determinedDose > 0) {
                doseIcon.textContent = ` | ${determinedDose}mg`;
            }
            doseIcon.className = doseClass;
            doseCounter++;
            cell.appendChild(doseIcon);
            row.appendChild(cell);
            if (i == 6 && periodindicatorDisplayed && !options.SidedWeekNumberingLeft) {
                console.log("sidedright");
                periodindicatorCounter++;
                weekValueInjection(periodindicatorCounter, row);
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);

            // Stop if we exceed the end date
            if (currentDate > options.EndDate) break;
        }

        tbody.appendChild(row);
        table.appendChild(tbody);
        container.appendChild(table);
    }

    // Add footer text if enabled
    if (options.FooterEnabled && options.FooterText) {
        const footerDiv = document.createElement("div");
        footerDiv.className = "footer-text";
        footerDiv.style.marginTop = "20px";
        footerDiv.style.whiteSpace = "pre-wrap"; // Preserve line breaks from textarea
        footerDiv.textContent = options.FooterText;
        container.appendChild(footerDiv);
    }
}
//  INJECT WEEK INDICATOR INTO TABLE
function weekIndicatorInjection(_target) {
    let cell = document.createElement("th");
    cell.textContent = `Week #`;
    cell.className = "th-weekindicator";
    _target.appendChild(cell);
}

//  INJECT WEEK VALUE INTO TABLE
function weekValueInjection(_counter, _target) {
    let cell = document.createElement("td");
    cell.textContent = `${_counter}`;
    cell.className = "td-weekindicator";
    _target.appendChild(cell);
}
// END OF GENERATORS

//  INPUT HANDLING -> TABLE GENERATION
function handleInputs() {
    // date inputs
    //document.getElementById("start-date").value = new Date();
    const startDateInput = document.getElementById("start-date").value;
    const endDateInput = document.getElementById("end-date").value;
    const dateLocaleInput = document.getElementById("date-locale").value;
    const timePeriodDisplayInput = document.getElementById("timeperiod-options").value;
    const sidedWeekNumberingInput = document.getElementById("timeperiod-sidedweek-side").checked;

    // dosage inputs
    const doseInput = document.getElementById("dose").value;
    const doseIncrementInput = document.getElementById("dose-increment").value;

    // dosage time inputs
    const doseIncrementTimesInput = document.getElementById("dose-increment-times").value;
    const dosePeriodInput = document.getElementById("dose-period").value;

    if (!startDateInput || !endDateInput) {
        alert("Please select both start and end dates.");
        return;
    }

    const dose = doseInput || 0;
    const doseIncrement = doseIncrementInput || 0;
    const doseIncrementTimes = doseIncrementTimesInput || 0;
    const dosePeriod = dosePeriodInput || 0;

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    if (startDate > endDate) {
        alert("Start date must be before the end date.");
        return;
    }

    /** @type {Options} */
    const options = {
        StartingDate: startDateInput,
        EndingDate: endDateInput,
        DateLocale: dateLocaleInput,
        TimePeriod: timePeriodDisplayInput,
        SidedWeekNumberingLeft: sidedWeekNumberingInput,

        Dose: dose,
        DoseIncrement: doseIncrement,
        DoseIncrementTimes: doseIncrementTimes,
        DosePeriod: dosePeriod,

        StartDate: startDate,
        EndDate: endDate,

        Title: document.getElementById("title").value,
        FooterEnabled: document.getElementById("footer-custom").checked,
        FooterText: document.getElementById("footer-custom-text").value,
    };

    generateWeeklyTables(options);
}
