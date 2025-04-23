---
title: "Scrolling in Money"
company: "Google"
sidebar_role: "Senior Designer"
timeline_text: "2013 — 2015"
lead: "AdWords is a complex tool through which much of Google's multi billion dollar advertising revenue is generated. During my time in AdWords UX, I focused on creating a more human experience for advertisers to help them better understand their data and make better decisions for their business. Here are some of the projects that I delivered on."

---

## Making complex data easier to understand

Traditionally, Display Network advertisers in AdWords had to decipher large amount of tabular data across 7 different tabs to understand their campaigns' performance. To uncover the important insights from noise, they needed to have the expertise to sort, filter and slice the data in the right ways. These pages looked like this:

<!-- type: image-full-width -->
![Adwords pages before my projects](/images/scrolling-in-money/before.webp)

## Why this was bad

This approach asked too much from the advertisers, and as a result many of them struggled with the Display Network. The Display summary project aimed to solve this problem by creating a consolidated page that surfaced the most important data visually. I was asked to lead the UX for it. 


I decided to use a card-based summary page. I started talking to some advertisers and created an initial set of cards based on the information I obtained about their workflow. These early explorations helped set the tone for the rest of the project.

As this was the first time a card-based UI was being introduced in AdWords, I had to create the Cards framework for all of AdWords so that the proper guidelines were in place to ensure consistency for future card-based features.

<!-- type: image-full-width -->
![Wireframes](/images/scrolling-in-money/wireframes.webp)

<!-- type: image-full-width -->
![Summary tab cards in various states after several iterations](/images/scrolling-in-money/cards.webp)

## Testing

It took multiple rounds of user testing and many iterations for the Display summary project to evolve. Along the way I worked with the data visualization engineering team, defining new advanced features for them to implement, such as the ability to show pie chart labels using whiskers. The final result was a simple, clean, and visually driven single-page summary that showed only the most important insights and allowed advertisers to dive in deeper if required. This also provided inspiration for the later Material redesign of AdWords.

<!-- type: image-full-width -->
![Summary tab cards in various states after several iterations](/images/scrolling-in-money/summary-final.webp)

## Making campaign creation easier

Creating a new All Features ad campaign in AdWords used to involve filling out a long, complex form full of technical jargon. In order to configure a successful campaign, advertisers had to know how to map their business goals into our features and terminology. This wasn't easy for everyone. For example, this was the length of the form for only the first step of the campaign creation process:

<!-- type: image-full-width -->
![Before](/images/scrolling-in-money/campaign-before.webp)

## A new framework

One of my biggest projects at AdWords was designing the UX framework for a new goal-based campaign creation flow. The idea was to start by asking advertisers what their goals were, and then surfacing only the features relevant for their goals. Our two main challenges were: 1) defining a common set of goals that accurately portrayed advertiser needs and 2) creating the best possible user experience for goal-selection. This was a huge effort that involved a multitude of stakeholders across product areas within and beyond AdWords, who all had to agree on a commonly defined taxonomy and overall user experience.
While my PM counterpart focused on the first challenge, I started exploring many different UIs for goal-selection and rapidly testing and iterating on them. Here are some of the explorations:

<!-- type: image-full-width -->
![Various explorations of the marketing objective picker](/images/scrolling-in-money/campaign-explorations.webp)

## TESTING

We found out through user testing that advertisers preferred to see all the available goals at once. Presenting all the options without making the UI feel overwhelming became a challenge. I used colors, illustrations, and subtle variations in typography to make the UI less intimidating. 

We also had other technical challenges. For example, within our four categories of goals, advertisers were only allowed to select goals from a single category. Furthermore, there were some options that were mutually-exclusive, even within the same category. To address the first issue, I used subtle transitions and animations to 'reset' the selection if users tried to select from multiple buckets. For the second problem, I took a somewhat unorthodox approach of using dividing lines with an 'or' label to indicate what options could be selected together. Using radio buttons would have added another level of indentation, making it unnecessarily more complex. Both of these approaches tested really well with users.

Today, at the start of campaign creation, instead of seeing a giant form advertisers now see this. We ask them to tell us about their goals in their own language, not ours. Based on their selection we tailor the rest of the process to highlight only the features and options that are most relevant.

<!-- type: video -->
[video](/videos/compressed/compass-white.mp4)

## Contributing to the material design specs

Campaign creation is a multi-step process. While redesigning campaign creation, I also led a small team of designers and prototypers who created the specs for the Material Design stepper component, which was then added to the public Material Design library.

<!-- type: image-full-width -->
![Stepper component specs, part of the Material Design library](/images/scrolling-in-money/stepper.webp)

## Making ads more beautiful (and effective)

Nobody likes ugly banner ads. One of my personal missions when I joined AdWords was to help the internet have fewer ugly ads. I was never asked to work on ad formats or templates, but because it of my passion I did a lot of work around it.

First, I realized some of banner ad templates in the AdWords library were outdated and poorly-designed. These templates were typically used by smaller advertisers who did not have the resources to hire designers to create custom creatives. I decided to clean up the 12 old templates, and also create four brand new ones. I traveled to Shanghai where the engineers for this feature were and spent a week polishing their implementation, helping them define all the transitions and animations correctly. I also gave them a talk about the classic principles of good design.

In addition to these templates, the ad formats team were also working on a project that involved automatically converting text ads into rich, display ads. This was done by finding the advertisers' logo, extracting relevant images from the advertisers' other display ads, and then combining them with the messaging from their text ad. 

<!-- type: image-full-width -->
![I designed these four new templates for the AdWords ads gallery](/images/scrolling-in-money/new-ads.webp)

<!-- type: image-full-width -->
![converting text ads into rich, display ads](/images/scrolling-in-money/rich-ads.webp)

## Helping engineers
There was a lot of engineering magic going on behind the scenes to extract these logos and images, but stitching them all together programmatically in a way that resulted in a beautiful creative was an immense challenge.

I volunteered to help them. First, I specified in detail a framework for selecting the right colors, based on the existing colors of the logo in a way that would preserve the advertiser brand. Then, I created an extensive layout library based on the extracted image size and aspect ratio. This type of layout and color selection was never specced out in this detail before.

This helped developers know exactly how to lay out the creative in every possible situation and for all the major ad sizes. You can read more about richer text ads on the AdSense blog. While I cannot share the numbers, this project also proved that design can directly impact the performance of the ads.

<!-- type: image-full-width -->
![converting text ads into rich, display ads](/images/scrolling-in-money/rich-text-ads.webp)

## Helping advertisers learn about their audience

AdWords Audience Insight was another one of my projects. To run a successful campaign, advertisers not only need to know who their audience is, but also who is responding to their message. Using Audience Insights advertisers can do just that.

As with my other projects, I worked closely with the PM to define what the product should be, and then collaborated with user researchers to observe and interview actual advertisers trying to use it. I also created fully-functioning html prototypes to define all the animations and transitions for the engineers, often helping them implement their CSS in production code. Here's how the shipped audience insights product looks like:

<!-- type: video -->
[video](/videos/compressed/audience.mp4)

## Reflection

Designing for the product that is Google's main source of revenue requires a level of discipline, thoroughness, and dedication to learning that is hard to experience in other products or teams. Every design detail and proposal is thoroughly reviewed and questioned, often in multiple rounds by senior stakeholders. Obtaining deep product knowledge and validating your designs through research are absolutely essential to getting past design reviews. I was immensely fortunate to be part of this process and to have had the chance to work on projects with lasting impact, both on advertisers and on Google's core business.