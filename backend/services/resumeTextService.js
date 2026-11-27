// pdf-parse ek npm package hai jo PDF files ko read karne
// aur unse text extract karne ke liye use hota hai.
//
// PDFParse is package ki class hai.
// Class se hum ek parser object create karenge.
import { PDFParse } from "pdf-parse";


// Function PDF file ke Buffer ko receive karega
// aur uske andar ka text extract karke return karega.
//
// async ka use isliye kiya hai kyunki PDF se text extract
// karne ka operation asynchronous hai.
//
// buffer = uploaded PDF ka actual binary data
export async function extractTextFromPdfBuffer(buffer) {

    // ---------------------------------------------
    // STEP 1: CHECK KARO KI INPUT ACTUAL PDF HAI
    // ---------------------------------------------

    //Here we are checking that the argument which received is buffer or not and In 2nd part buffer.subarray(0,5).toString() !== "%PDF-" me check kar rahe ki ye Buffer PDF ka hai ya nahi.
    //<Buffer 25 50 44 46 2d  ...> ke initail 5 string PDF ke signature hote hai. 
    //The leading bytes 25 50 44 46 2d are a hexadecimal "magic number" signature that decodes to the ASCII text %PDF-, which every valid PDF file starts with.
    /**  
         Byte-by-Byte Breakdown
         Hexadecimal Byte	Decimal (ASCII)	Character
         25	37	%
         50	80	P
         44	68	D
         46	70	F
         2d	45	-
 
   */

    if (!Buffer.isBuffer(buffer) || buffer.subarray(0, 5).toString() !== "%PDF-") {
        const error = new Error("Uploaded file is not a valid PDF.");

        error.status = 400;
        throw error;

    }

    // ---------------------------------------------
    // STEP 2: PDF PARSER CREATE KARO
    // ---------------------------------------------

    let parser;

    console.log(parser);


    try {
        parser = new PDFParse({ data: new Uint8Array(buffer) });

          console.log(parser);

        // ---------------------------------------------
        // STEP 3: PDF SE TEXT EXTRACT KARO
        // ---------------------------------------------
        const result = await parser.getText({ first: 10 });


        // ---------------------------------------------
        // STEP 4: EXTRACTED TEXT NIKALO
        // ---------------------------------------------
        const rawText = result?.text || "";

        // ---------------------------------------------
        // STEP 5: EXTRACTED TEXT CLEAN KARO
        // ---------------------------------------------

        // Extra spaces aur zyada blank lines clean karo
        return rawText
            .replace(/\r/g, "")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

    } catch (error) {
        const pdfError = new Error(
            "Could not read PDF. It may be scanned, corrupted, or password-protected."
        );

        pdfError.status = 422;
        throw pdfError;
    } finally {
        await parser?.destroy();
    }





}