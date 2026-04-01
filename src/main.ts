// Medication object
/**
 * Definition for Medication object.
 */
interface IMedication {
    name: string;
    dose: number;
    doseFrequency: number;
    doseIncrement: number;
    doseIncrementTimes: number;
    dosePeriod: number;
    doseUnit: string;
    getCombinedDosage(): number;
}

// Options object
/**
 * Configuration options for generating a weekly table.
 */
interface Options {
    StartingDate: string;
    EndingDate: string;
    DateLocale: string;
    TimePeriod: string;
    SidedWeekNumberingLeft: boolean;
    Medications: IMedication[];
    StartDate: Date;
    EndDate: Date;
    Title: string;
    FooterEnabled: boolean;
    FooterText: string;
    PadWeeks: boolean;
    WeekStartDay: number;
}

// DateFormat object
/**
 * Configuration options for date formatting.
 */
interface DateFormat {
    Short: Intl.DateTimeFormatOptions;
    ShortMonth: Intl.DateTimeFormatOptions;
    Long: Intl.DateTimeFormatOptions;
    Weekday: Intl.DateTimeFormatOptions;
}

const DoseUnits = (): string[] => ["mg", "g", "unit", "tblt", "cspl", "ml", "tbsp", "tsp"];

window.addEventListener("DOMContentLoaded", () => {
    renderMedicationInputs();
});

// CLASSES
function Medication(
    this: IMedication,
    name: string,
    dose: number,
    doseFrequency: number,
    doseIncrement: number,
    doseIncrementTimes: number,
    dosePeriod: number,
    doseUnit: string
) {
    this.name = name;
    this.dose = dose;
    this.doseFrequency = doseFrequency;
    this.doseIncrement = doseIncrement;
    this.doseIncrementTimes = doseIncrementTimes;
    this.dosePeriod = dosePeriod;
    this.doseUnit = doseUnit;

    this.getCombinedDosage = function (this: IMedication) {
        // Note: original code used this.doseIntervals which was not defined in the constructor or interface
        // Preserving the logical flow/potential mistake as requested.
        return this.dose * (this as any).doseIntervals;
    };
}

// EVENTS
//  TIME PERIOD
function timePeriodOptionChanged(): void {
    const timePeriodOption = (document.getElementById("timeperiod-options") as HTMLSelectElement).value;
    let weekSideHTML = [
        document.getElementById("timeperiod-sidedweek-side-label"),
        document.getElementById("timeperiod-sidedweek-side")
    ];
    let customLabelHTML = [
        document.getElementById("timeperiod-customlabel-label"),
        document.getElementById("timeperiod-customlabel")
    ];

    // Hide the week side bool checkbox
    weekSideHTML.forEach((element) => {
        if (element) element.style.display = "none";
    });
    // Hide the custom label input
    customLabelHTML.forEach((element) => {
        if (element) element.style.display = "none";
    });

    if (timePeriodOption == "sidedweeknumber") {
        // Show the week side bool checkbox
        weekSideHTML.forEach((element) => {
            if (element) element.style.display = "inline";
        });
    }
    if (timePeriodOption == "custom") {
        // Show the custom label input
        customLabelHTML.forEach((element) => {
            if (element) element.style.display = "inline";
        });
    }
}

// RENDER MEDICATION INPUTS
function renderMedicationInputs(): void {
    const container = document.getElementById("medications-container");
    if (!container) return;
    const countInput = document.getElementById("medications-count") as HTMLInputElement;
    const count = parseInt(countInput.value) || 0;
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
function generateWeeklyTables(optionsObject: Options): void {
    const debug = true;
    if (debug) {
        Object.keys(optionsObject).forEach((key) => {
            console.log(`${key}: ${(optionsObject as any)[key]}`);
        });
    }

    const options = optionsObject;
    const container = document.getElementById("table-container");
    if (!container) return;

    const dateFormat: DateFormat = {
        Short: { day: "numeric" },
        ShortMonth: { day: "numeric", month: "short" },
        Long: { year: "numeric", month: "long", day: "numeric" },
        Weekday: { weekday: "long" },
    };

    container.innerHTML = "";
    let currentDate = new Date(options.StartingDate);
    let table = document.createElement("table");

    let weekdays = document.createElement("thead");
    weekdays.id = "thead-weekdays";
    let weekdayRow = document.createElement("tr");
    const startDayGridOffset = (options.StartDate.getDay() - options.WeekStartDay + 7) % 7;

    let tableSpan = 7;
    let periodindicatorDisplayed = false;
    let periodindicatorCounter = 0;

    const mainTitle = document.getElementById("main-title");
    if (mainTitle) {
        mainTitle.textContent = options.Title || "Medication Schedule";
    }

    if (options.TimePeriod == "sidedweeknumber") {
        periodindicatorDisplayed = true;
        tableSpan = 8;
    }

    if (periodindicatorDisplayed && options.SidedWeekNumberingLeft) {
        console.log("sidedleft");
        weekIndicatorInjection(weekdayRow);
    }

    for (let i = 0; i < 7; i++) {
        let weekdayCell = document.createElement("th");
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

    let currentDayOffset = 0;

    while (currentDate <= options.EndDate) {
        if (options.TimePeriod == "weekstarting" || options.TimePeriod == "custom") {
            let customLabelValue = (document.getElementById("timeperiod-customlabel") as HTMLInputElement).value;
            let _option: string | number = options.TimePeriod == "weekstarting" ? 0 : options.TimePeriod == "custom" ? customLabelValue : "Error";

            if (options.TimePeriod == "custom" && table.querySelector(".header-custom-period")) {
                // Already added, skip
            } else {
                let thead = document.createElement("thead");
                let headerRow = document.createElement("tr");
                let headerCell = document.createElement("th");
                headerCell.colSpan = tableSpan;
                if (_option === 0) {
                    headerCell.textContent = `Week Starting: ${currentDate.toLocaleDateString(options.DateLocale, dateFormat.Long)}`;
                } else {
                    headerCell.textContent = _option as string;
                    headerCell.className = "header-custom-period";
                }
                headerCell.classList.add("header-week-outline");
                headerRow.appendChild(headerCell);
                thead.appendChild(headerRow);
                table.appendChild(thead);
            }
        }

        let tbody = document.createElement("tbody");
        let row = document.createElement("tr");

        if (periodindicatorDisplayed && options.SidedWeekNumberingLeft) {
            console.log("sidedleft");
            periodindicatorCounter++;
            weekValueInjection(periodindicatorCounter, row);
        }

        let leadingPadding = 0;
        if (currentDate.getTime() === options.StartDate.getTime()) {
            leadingPadding = startDayGridOffset;
        }

        for (let i = 0; i < 7; i++) {
            let cell = document.createElement("td");

            if (leadingPadding > 0) {
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
                            let linesToDraw = freq > 1 ? freq : 1;

                            for (let j = 0; j < linesToDraw; j++) {
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

    if (options.FooterEnabled && options.FooterText) {
        const footerDiv = document.createElement("div");
        footerDiv.className = "footer-text";
        footerDiv.style.marginTop = "20px";
        footerDiv.style.whiteSpace = "pre-wrap";
        footerDiv.textContent = options.FooterText;
        container.appendChild(footerDiv);
    }
}

function weekIndicatorInjection(_target: HTMLElement): void {
    let cell = document.createElement("th");
    cell.textContent = `Week #`;
    cell.className = "th-weekindicator";
    _target.appendChild(cell);
}

function weekValueInjection(_counter: number, _target: HTMLElement): void {
    let cell = document.createElement("td");
    cell.textContent = `${_counter}`;
    cell.className = "td-weekindicator";
    _target.appendChild(cell);
}

function handleInputs(): void {
    const startDateInput = (document.getElementById("start-date") as HTMLInputElement).value;
    const endDateInput = (document.getElementById("end-date") as HTMLInputElement).value;
    const dateLocaleInput = (document.getElementById("date-locale") as HTMLSelectElement).value;
    const timePeriodDisplayInput = (document.getElementById("timeperiod-options") as HTMLSelectElement).value;
    const sidedWeekNumberingInput = (document.getElementById("timeperiod-sidedweek-side") as HTMLInputElement).checked;

    const countInput = document.getElementById("medications-count") as HTMLInputElement;
    const count = parseInt(countInput.value) || 0;
    const medications: IMedication[] = [];

    for (let i = 0; i < count; i++) {
        let name = (document.getElementById(`med-name-${i}`) as HTMLInputElement)?.value || "";
        let dose = parseFloat((document.getElementById(`med-dose-${i}`) as HTMLInputElement)?.value) || 0;
        let unit = (document.getElementById(`med-unit-${i}`) as HTMLSelectElement)?.value || "mg";
        let freq = parseInt((document.getElementById(`med-freq-${i}`) as HTMLInputElement)?.value) || 1;
        let inc = parseFloat((document.getElementById(`med-increment-${i}`) as HTMLInputElement)?.value) || 0;
        let incTimes = parseInt((document.getElementById(`med-increment-times-${i}`) as HTMLInputElement)?.value) || 0;
        let period = parseInt((document.getElementById(`med-period-${i}`) as HTMLInputElement)?.value) || 0;

        medications.push(new (Medication as any)(name, dose, freq, inc, incTimes, period, unit));
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

    const options: Options = {
        StartingDate: startDateInput,
        EndingDate: endDateInput,
        DateLocale: dateLocaleInput,
        TimePeriod: timePeriodDisplayInput,
        SidedWeekNumberingLeft: sidedWeekNumberingInput,

        Medications: medications,

        StartDate: startDate,
        EndDate: endDate,

        Title: (document.getElementById("title") as HTMLInputElement).value,
        FooterEnabled: (document.getElementById("footer-custom") as HTMLInputElement).checked,
        FooterText: (document.getElementById("footer-custom-text") as HTMLTextAreaElement).value,
        PadWeeks: (document.getElementById("pad-weeks") as HTMLInputElement).checked,
        WeekStartDay: parseInt((document.getElementById("week-start-day") as HTMLSelectElement).value),
    };

    generateWeeklyTables(options);
}

// Expose functions to window for HTML event handlers
(window as any).timePeriodOptionChanged = timePeriodOptionChanged;
(window as any).renderMedicationInputs = renderMedicationInputs;
(window as any).handleInputs = handleInputs;
