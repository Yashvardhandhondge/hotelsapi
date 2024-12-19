import puppeteer from "puppeteer";
import fs from 'fs/promises';


const scrapeHotels = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto(
        "https://www.airbnb.co.in/s/Dubai--United-Arab-Emirates/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&flexible_trip_lengths%5B%5D=one_week&monthly_start_date=2025-01-01&monthly_length=3&monthly_end_date=2025-04-01&price_filter_input_type=0&channel=EXPLORE&query=Dubai%2C%20United%20Arab%20Emirates&place_id=ChIJRcbZaklDXz4RYlEphFBu5r0&date_picker_type=calendar&checkin=2024-12-26&checkout=2025-01-19&adults=2&infants=1&children=1&source=structured_search_input_header&search_type=autocomplete_click&search_mode=regular_search&price_filter_num_nights=24&federated_search_session_id=bbad6041-cfea-43f1-a3cf-cfde6d498748&pagination_search=true&cursor=eyJzZWN0aW9uX29mZnNldCI6MCwiaXRlbXNfb2Zmc2V0IjoyNTIsInZlcnNpb24iOjF9",
        { waitUntil: "networkidle0" } // Changed to ensure all content is loaded
    );

    // Wait for the listings to load
    await page.waitForSelector('div[aria-labelledby^="title_"]');

    // Extract hotel details
    const hotels = await page.evaluate(() => {
        const hotelElements = document.querySelectorAll('div[aria-labelledby^="title_"]');
        
        return Array.from(hotelElements).map((hotel) => {
            // Main heading (property name)
            const mainHeadingElement = document.getElementById(hotel.getAttribute('aria-labelledby'));
            const mainHeading = mainHeadingElement ? mainHeadingElement.innerText.trim() : "Main heading not found";

            // Subheading (property description)
            const subHeadingElement = hotel.querySelector('.t6mzqp7');
            const subHeading = subHeadingElement ? subHeadingElement.innerText.trim() : "Subheading not found";

            // Price
            const priceElement = hotel.querySelector('span._11jcbg2');
            let price = "Price not found";
            if (priceElement) {
                // Clean up price string (remove currency symbol and 'night' text)
                price = priceElement.innerText.trim().replace(/[^0-9.]/g, '');
            }

            // Total price (if needed)
            const totalPriceElement = hotel.querySelector('div._tt122m');
            const totalPrice = totalPriceElement ? 
                totalPriceElement.innerText.trim().replace(/[^0-9.]/g, '') : 
                "Total price not found";

            return {
                mainHeading,
                subHeading,
                pricePerNight: price,
                totalPrice
            };
        });
    });

    console.log('Scraped Data:', hotels);
    
    // Optional: Save to JSON file
    await fs.writeFile('page15.json', JSON.stringify(hotels, null, 2));

    await browser.close();
};

scrapeHotels().catch(console.error);