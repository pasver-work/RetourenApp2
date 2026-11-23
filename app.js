let artikelen = [];
let huidigArtikel = null;
let scanner = null;

// =====================================
// HULPFUNCTIES
// =====================================

function normaliseerBarcode(barcode) {

    return String(barcode || "")
        .replace(/\s/g, "")
        .trim();

}

// =====================================
// ARTIKELEN LADEN
// =====================================

async function laadArtikelen() {

    try {

        const response =
            await fetch(
                "ArtikelenApp.csv"
            );

        const csv =
            await response.text();

        const regels =
            csv.split(/\r?\n/);

        for (let i = 1; i < regels.length; i++) {

            if (!regels[i].trim()) {
                continue;
            }

            const kolommen =
                regels[i].split("|");

            artikelen.push({

                artikel:
                    kolommen[0]?.trim() || "",

                omschrijving:
                    kolommen[1]?.trim() || "",

                eanCE:
                    normaliseerBarcode(
                        kolommen[2]
                    ),

                eanHE:
                    normaliseerBarcode(
                        kolommen[3]
                    ),

                leverancier:
                    kolommen[4]?.trim() || "",

                vmi:
                    kolommen[5]?.trim() || ""

            });

        }

        console.log(
            "Artikelen geladen:",
            artikelen.length
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}

// =====================================
// ARTIKEL ZOEKEN
// =====================================

function zoekArtikel(barcode) {

    const zoekwaarde =
        normaliseerBarcode(
            barcode
        );

    document
        .getElementById("barcode")
        .value =
        zoekwaarde;

    const artikel =

        artikelen.find(a =>

            a.eanCE === zoekwaarde ||

            a.eanHE === zoekwaarde

        );

    if (!artikel) {

        huidigArtikel = null;

        document
            .getElementById(
                "resultaat"
            )
            .innerHTML =

`
<div class="detail-card">

<div class="detail-title">

Artikel niet gevonden

</div>

<div class="detail-text">

Barcode:
${zoekwaarde}

</div>

</div>
`;

        return;

    }

    huidigArtikel = artikel;

    document
        .getElementById(
            "resultaat"
        )
        .innerHTML =

`
<div class="detail-card">

<div class="detail-title">

Artikel Details

</div>

<div class="detail-text">

<b>Artikel:</b>
${artikel.artikel}

</div>

<div class="detail-text">

<b>Omschrijving:</b>
${artikel.omschrijving}

</div>

<div class="detail-text">

<b>EAN/CE:</b>
${artikel.eanCE}

</div>

<div class="detail-text">

<b>EAN/HE:</b>
${artikel.eanHE}

</div>

<div class="detail-text">

<b>Leverancier:</b>
${artikel.leverancier}

</div>

<div class="detail-text">

<b>VMI:</b>
${artikel.vmi}

</div>

</div>

<div class="aantal-card">

<h2>Aantal</h2>

<div class="aantal-container">

<button
class="aantal-knop"
onclick="verlaagAantal()">

-

</button>

<span
id="aantal"
class="aantal-waarde">

1

</span>

<button
class="aantal-knop"
onclick="verhoogAantal()">

+

</button>

</div>

</div>

<div class="section-card">

<label class="field-label">

Source

</label>

<select id="source">

<option>WRAPPERS</option>
<option>COM DOWNSTAIRS</option>
<option>COM UPSTAIRS</option>
<option>OTHER</option>

</select>

</div>

<div class="section-card">

<label class="field-label">

Action

</label>

<select id="action">

<option>Feed in again</option>
<option>Garbagebin</option>
<option>Canteen</option>
<option>3114 Jumbo Schijndel</option>
<option>3127 Jumbo Eindhoven WC Woensel</option>
<option>4608 Jumbo Uden Drossaard</option>
<option>4834 Nieuw Bergen</option>
<option>4848 Jumbo Den Bosch Rompertpassage</option>
<option>4864 Jumbo Heeswijk Dinther</option>
<option>4892 Jumbo Rosmalen</option>
<option>4897 Jumbo Schijndel Rooiseheide</option>
<option>4909 Uden Muziekplein</option>
<option>4989 Jumbo Parkstraat Nistelrode</option>
<option>50587 Jumbo Helmond</option>
<option>5127 Jumbo Sint-Oedenrode</option>
<option>5135 Jumbo Valkenswaard Leenderweg</option>
<option>5137 Jumbo Veghel Stationsstraat</option>

</select>

</div>

<button
class="send-button"
onclick="verstuurMelding()">

VERSTUUR

</button>
`;

}

// =====================================
// AANTAL
// =====================================

function verhoogAantal() {

    const element =
        document.getElementById(
            "aantal"
        );

    element.innerText =
        parseInt(
            element.innerText
        ) + 1;

}

function verlaagAantal() {

    const element =
        document.getElementById(
            "aantal"
        );

    let aantal =
        parseInt(
            element.innerText
        );

    if (aantal > 1) {

        aantal--;

    }

    element.innerText =
        aantal;

}

// =====================================
// VERSTUREN
// =====================================

function verstuurMelding() {

    if (!huidigArtikel) {

        alert(
            "Scan eerst een artikel."
        );

        return;

    }

    const datumTijd =
        new Date()
        .toLocaleString(
            "nl-NL"
        );

    const aantal =
        document
        .getElementById(
            "aantal"
        )
        .innerText;

    const source =
        document
        .getElementById(
            "source"
        )
        .value;

    const action =
        document
        .getElementById(
            "action"
        )
        .value;

    alert(

`Datum en tijd: ${datumTijd}

Artikel: ${huidigArtikel.artikel}

Omschrijving: ${huidigArtikel.omschrijving}

Aantal: ${aantal}

Action: ${action}

Source: ${source}

VMI: ${huidigArtikel.vmi}`

    );

    document
        .getElementById(
            "barcode"
        )
        .value = "";

    document
        .getElementById(
            "resultaat"
        )
        .innerHTML = "";

    huidigArtikel = null;

    if (scanner) {

        scanner.resume();

    }

}

// =====================================
// SCANNER
// =====================================

async function startScanner() {

    const cameras =
        await Html5Qrcode.getCameras();

    let cameraId =
        cameras[cameras.length - 1].id;

    const achterCamera =

        cameras.find(camera => {

            const naam =
                camera.label.toLowerCase();

            return (
                naam.includes("back") ||
                naam.includes("rear")
            );

        });

    if (achterCamera) {

        cameraId =
            achterCamera.id;

    }

    scanner =
        new Html5Qrcode(
            "reader"
        );

    await scanner.start(

        cameraId,

        {
            fps: 15,

            qrbox: {
                width: 320,
                height: 120
            },

            formatsToSupport: [

                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128

            ]

        },

        (barcode) => {

            navigator.vibrate?.(100);

            scanner.pause(true);

            zoekArtikel(
                barcode
            );

        }

    );

}

// =====================================
// START APP
// =====================================

window.onload = async () => {

    await laadArtikelen();

    startScanner();

};