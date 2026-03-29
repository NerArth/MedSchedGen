// DOCUMENTATION
// These JSDoc definitions are not fully compatible with VSCode but can still be partly used by hovering over the "type" definition over a variable
// Unfortunately, this requires manually updating the documentation if the variable names are changed
// This is a limitation of the JSDoc system and the way it is implemented in VSCode

/*
 * Script Vars
 * @property {Array} DoseUnits - Available dosing units to pick from.
 */

// Medication object
/**
 * Definition for Medication object.
 * @typedef {Object} Medication
 * @property {string} name - The name of the medication
 * @property {number} dose - The base dose amount
 * @property {number} doseFrequency - The number of times the dose is taken in a day
 * @property {number} doseIncrement - The increment amount for dose adjustments
 * @property {number} doseIncrementTimes - The number of times the dose increment occurs
 * @property {number} dosePeriod - The period over which doses are administered
 * @property {string} doseUnit - The unit of measurement for the dose (e.g., 'mg', 'ml')
 */

// Options object
/**
 * Configuration options for generating a weekly table.
 * @typedef {Object} Options
 * @property {string} StartingDate - The starting date input for the schedule.
 * @property {string} EndingDate - The ending date input for the schedule.
 * @property {string} DateLocale - The locale used for formatting dates.
 * @property {string} TimePeriod - The display format for the time period.
 * @property {boolean} SidedWeekNumberingLeft - Whether to display the week number on the left side; otherwise right side.
 * @property {Array} Medications - Array of different medications to include in the schedule.
 * @property {number} Dose - The initial dose value.
 * @property {number} DoseIncrement - The amount by which the dose is incremented.
 * @property {number} DoseIncrementTimes - The number of times the dose is incremented.
 * @property {number} DosePeriod - The period over which the dose is administered.
 * @property {Date} StartDate - The parsed starting date object.
 * @property {Date} EndDate - The parsed ending date object.
 * @property {string} Title - The title text for the table.
 * @property {boolean} FooterEnabled - Whether the footer text is enabled.
 * @property {string} FooterText - The freeform text for the footer.
 * @property {boolean} PadWeeks - Whether to pad the final week with empty cells to make a full 7-day row.
 * @property {number} WeekStartDay - The day of the week the schedule starts on (0=Sunday, 1=Monday, etc.)
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
// document.getElementById("start-date").value = new Date().toISOString().split("T")[0];
// document.getElementById("end-date").value = new Date().toISOString().split("T")[0];

const DoseUnits = () => ["mg", "g", "unit", "tblt", "cspl", "ml", "tbsp", "tsp"];

window.addEventListener("DOMContentLoaded", () => {
    renderMedicationInputs();
});

// CLASSES
/** @type {Object} Medication */
function Medication(name, dose, doseFrequency, doseIncrement, doseIncrementTimes, dosePeriod, doseUnit) {
    // the medication class here is an abstract placeholder prototype to represent a medication. It will be extended with specific properties and methods as needed.
    this.name = name;
    this.dose = dose;
    this.doseFrequency = doseFrequency;
    // this.doseIntervalPeriod = this.doseIntervalPeriod; // PH - not to be used for now.
    this.doseIncrement = doseIncrement;
    this.doseIncrementTimes = doseIncrementTimes;
    this.dosePeriod = dosePeriod;
    this.doseUnit = doseUnit;

    // Additional methods that might be needed for medication scheduling
    this.getCombinedDosage = function () {
        return this.dose * this.doseIntervals;
    };
}

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

// RENDER MEDICATION INPUTS
function renderMedicationInputs() {
    const container = document.getElementById("medications-container");
    if (!container) return;
    const count = parseInt(document.getElementById("medications-count").value) || 0;
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const medDiv = document.createElement("div");
        medDiv.className = "medication-input-group";

        // Build unit options
        const unitOptions = DoseUnits()
            .map((unit) => `<option value="${unit}">${unit}</option>`)
            .join("");

        medDiv.innerHTML = `
            <strong style="display:block; margin-bottom:5px;">Medication ${i + 1}</strong>
            <label for="med-name-${i}">Name:</label><input id="med-name-${i}" type="text" placeholder="e.g. Concerta" /><br />
            <label for="med-dose-${i}">Dosage:</label><input id="med-dose-${i}" type="number" placeholder="n/a" style="width: 60px" />
            <select id="med-unit-${i}">
                ${unitOptions}
            </select><br />
            <label for="med-freq-${i}">Frequency (times/day):</label><input id="med-freq-${i}" type="number" value="1" min="1" /><br />
            <label for="med-increment-${i}">Change amount:</label><input id="med-increment-${i}" type="number" placeholder="n/a" /><br />
            <label for="med-increment-times-${i}"># of dose changes:</label><input id="med-increment-times-${i}" type="number" placeholder="n/a" /><br />
            <label for="med-period-${i}">Days on each dose:</label><input id="med-period-${i}" type="number" placeholder="n/a" />
        `;
        container.appendChild(medDiv);
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
    // Calculate how many days back the "Grid Week" starts relative to the StartDate
    const startDayGridOffset = (options.StartDate.getDay() - options.WeekStartDay + 7) % 7;

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
    // Generate headers based on WeekStartDay (using schedule context)
    for (let i = 0; i < 7; i++) {
        let weekdayCell = document.createElement("th");
        // Get the date for this column in the first week of the schedule
        let displayDay = new Date(options.StartDate);
        displayDay.setDate(displayDay.getDate() - startDayGridOffset + i);

        weekdayCell.textContent = `${displayDay.toLocaleDateString(options.DateLocale, dateFormat.Weekday)}`;
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
    let currentDayOffset = 0;

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

        // Table Body (Days)
        let tbody = document.createElement("tbody");
        let row = document.createElement("tr");

        if (periodindicatorDisplayed && options.SidedWeekNumberingLeft) {
            console.log("sidedleft");
            periodindicatorCounter++;
            weekValueInjection(periodindicatorCounter, row);
        }

        // Calculate leading padding for the first row
        let leadingPadding = 0;
        if (currentDate.getTime() === options.StartDate.getTime()) {
            leadingPadding = startDayGridOffset;
        }

        for (let i = 0; i < 7; i++) {
            let cell = document.createElement("td");

            if (leadingPadding > 0) {
                // Leading padding cell
                cell.classList.add("td-padding");
                if (!options.PadWeeks) cell.classList.add("td-padding-hidden");
                cell.innerHTML = "&nbsp;";
                leadingPadding--;
            } else if (currentDate <= options.EndDate) {
                let dateElement = document.createElement("div");
                dateElement.className = "cell-date";
                if (currentDate.getDate() === 1) {
                    dateElement.textContent = currentDate.toLocaleDateString(options.DateLocale, dateFormat.ShortMonth);
                } else {
                    dateElement.textContent = currentDate.toLocaleDateString(options.DateLocale, dateFormat.Short);
                }
                cell.appendChild(dateElement);

                // Add medications dosages
                if (options.Medications && options.Medications.length > 0) {
                    options.Medications.forEach((med) => {
                        let iteration = 0;
                        if (med.dosePeriod > 0) {
                            iteration = Math.floor(currentDayOffset / med.dosePeriod);
                            if (iteration > med.doseIncrementTimes) {
                                iteration = med.doseIncrementTimes;
                            }
                        }

                        let determinedDose = Number(med.dose) + Number(med.doseIncrement) * iteration;

                        if (determinedDose > 0 || med.name) {
                            let doseElement = document.createElement("div");
                            doseElement.className = "cell-dose";
                            let text = "";
                            if (med.name) text += `<strong>${med.name}</strong>: `;
                            if (determinedDose > 0) {
                                text += `${determinedDose}${med.doseUnit}`;
                            }
                            if (med.doseFrequency > 1) {
                                text += ` (${med.doseFrequency}x/day)`;
                            }
                            doseElement.innerHTML = text;
                            cell.appendChild(doseElement);

                            let freq = Number(med.doseFrequency) || 1;
                            let linesToDraw = freq > 1 ? freq : 1; // You previously had freq - 1, but this would result in 1 line for both freq=1 and freq=2.

                            for (let i = 0; i < linesToDraw; i++) {
                                let handwritingElement = document.createElement("div");
                                handwritingElement.className = "cell-handwriting";
                                cell.appendChild(handwritingElement);
                            }
                        }
                    });
                }

                currentDayOffset++;
                currentDate.setDate(currentDate.getDate() + 1);
            } else {
                // Trailing padding cell
                cell.classList.add("td-padding");
                if (!options.PadWeeks) cell.classList.add("td-padding-hidden");
                cell.innerHTML = "&nbsp;";
            }

            row.appendChild(cell);

            if (i == 6 && periodindicatorDisplayed && !options.SidedWeekNumberingLeft) {
                console.log("sidedright");
                periodindicatorCounter++;
                weekValueInjection(periodindicatorCounter, row);
            }
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

    // medications input collection
    const count = parseInt(document.getElementById("medications-count").value) || 0;
    const medications = [];

    for (let i = 0; i < count; i++) {
        let name = document.getElementById(`med-name-${i}`)?.value || "";
        let dose = document.getElementById(`med-dose-${i}`)?.value || 0;
        let unit = document.getElementById(`med-unit-${i}`)?.value || "mg";
        let freq = document.getElementById(`med-freq-${i}`)?.value || 1;
        let inc = document.getElementById(`med-increment-${i}`)?.value || 0;
        let incTimes = document.getElementById(`med-increment-times-${i}`)?.value || 0;
        let period = document.getElementById(`med-period-${i}`)?.value || 0;

        medications.push(new Medication(name, dose, freq, inc, incTimes, period, unit));
    }

    if (!startDateInput || !endDateInput) {
        alert("Please select both start and end dates.");
        return;
    }

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

        Medications: medications,

        StartDate: startDate,
        EndDate: endDate,

        Title: document.getElementById("title").value,
        FooterEnabled: document.getElementById("footer-custom").checked,
        FooterText: document.getElementById("footer-custom-text").value,
        PadWeeks: document.getElementById("pad-weeks").checked,
        WeekStartDay: document.getElementById("week-start-day").value,
    };

    generateWeeklyTables(options);
}
