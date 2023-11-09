# CODE REVIEW BASED ON THE EXISTING CODE

The following code smells or problems were found in the source code and fixed:

1. Images do not have explicit width and height
Explicit width and height can be set on image elements to reduce layout shifts and improve CLS (Cumulative layout shift).

2. Document do not have a meta description
Meta descriptions may be included in search results to concisely summarize page content.

3. Usage of double equals in if condition
Rather than using double or triple equals we can just use if(variable), this gets validated of the value is true.

4. Reducers were not present for failedAddToReadingList and failedRemoveFromReadingList due to which the test cases were failing

5. Function call is made from the template (FIXED)
In book-search.component.html the call to custom function formateDate() was removed and replaced with a pipe to improve performance and avoid memory leak.

6. In book-search.component.spec.ts the observable that is beimg subscribed is not being unsubscribed (FIXED)
If a subscription is not closed, the function callback attached to it will be continuously called, this poses huge memory leak and performance issue. ngOnDestroy() method was implemented and the observable was unsubscribed.


# Given below are the suggestions to improve the code:

1. Ensure text remains visible during webfont load
   Leverage the font-display CSS feature to ensure text is user-visible while webfonts are loading

2. Preload key requests
   Consider using link rel=preload to prioritize fetching resources that are currently requested later in page load

3. Avoid large layout shifts
   These DOM elements contribute most to the CLS of the page

# LIGHTHOUSE ACCESSIBILITY REPORT

The issues that were detected and fixed while using lighthouse tool to test accessibility are:

1. Buttons do not have an accessibile name
   When a button doesn't have an accessible name, screen readers announce it as "button" making it unusable for 
   users who rely on screen readers.

2. Background and foreground colors do not have sufficient contrast ratio
   Low-contrast text is difficult or impossible for many users to read
   Text that is 18pt, or 14pt and bold, needs a contrast ratio of 3:1
   All other text needs a contrast ratio of 4.5:1

# MANUAL ACCESSIBILITY TESTING

The following accessibility issues were found while manually testing the code:

1. Landmarks (FIXED)
   Checked for ARIA Landmark role attributes in the page's source code
   No such roles were found.

2. Image Description (FIXED)
   Checked for alt attribute of images
   Images did not have alternative texts.

3. Interactive Content Description (FIXED)
   Checked the presence and clarity of the description of the interactive elements (buttons).
   There were no descriptions or they were incomprehensible
   