---
date: "2018-12-13T00:00:00Z"
excerpt: Monday morning. Your previous project just wrapped up, and they are going to assign you a brand new one. They even promised you the lead on this project. Who said Mondays couldn’t be great? A few hours later and you are staring at the most dreadful code you have ever seen — controllers of more than a thousand lines, PHP that injects jQuery in the views, raw SQL statements that could challenge a Dostoyevsky novel in size. The list goes on and on. This Monday is going to need a ton of coffee.
featured: /assets/posts/2018-12-13-love/header.jpg
title: A love letter to legacy projects
tump: /assets/posts/2018-12-13-love/tump.jpg
---

**This post wast orignially posted on the [24daysindecember](https://24daysindecember.net/2018/12/13/a-love-letter-to-legacy-projects/) site**

Monday morning. Your previous project just wrapped up, and they are going to assign you a brand new one. They even promised you the lead on this project. Who said Mondays couldn’t be great?

A few hours later and you are staring at the most dreadful code you have ever seen — controllers of more than a thousand lines, PHP that injects jQuery in the views, raw SQL statements that could challenge a Dostoyevsky novel in size. The list goes on and on. This Monday is going to need a ton of coffee.

The previous few lines might sound very familiar to you. You might even be working on a project like this at this very moment. If that is the case, … lucky you.

# Why do these horrible applications exist?
Most applications don’t start like this. As you know, green field applications start full of hopes, dreams and rainbows.
A new business idea gets launched. It does something small, pretty good. People like the application. They like it a lot. More and more customers flock to the application. You excitingly add more functionality to your small idea. Soon, one of your more prominent clients, asks for a very valid use case.

Hmm, you haven’t thought about this particular flow in the application. To be honest; the application doesn’t support it. However… it’s a big client, and it’s a great idea. You know what, this small little hack won’t make the difference. We’ll document it, so everyone knows about it.

Fast forward a few months. You have a dozen developers working for you, and your Kanban feature board is filled to the brim. The strange thing about the board, however, is that most of the features on that board don’t come from your hand, they come from customers. Moreover, they all want concrete things very tailored to their workflows. That little hack that’s been made a few months ago is now not even considered a hack anymore; it’s just how the application works. Moreover, if you take a step back, most of the application is now a collection of these small little hacks.

You might think that this is a horrible product, and from a code perspective you might be right. However, from a business perspective, this is a vital process. The product has a ton of customers, and they are invested enough to want to tailor it to their workflows and they even reach out to you with suggestions. Granted, not all of these suggestions are great, but they wouldn’t come forward if there weren’t a need for them.

# Is this the low point?
However, now where does that leave you, It’s entertaining to have a company with many customers, but at the end of the day, you’re still the one that is in the trenches of despair.

Not necessarily;
Having a product like this tend to generate income. The most significant part of that income is invested back into the project. Once the legacy code hampers the production of new features or generates too many bugs, the discussion surrounding refactoring parts of the code tend to start getting more and more speed.

Once you start refactoring, you suddenly notice that you have so much value in front of you — a ton of use cases already implemented, a wealth of user behaviour and data, metrics and most important of all: the budget and infrastructure to match.

# Working with legacy day to day
Most refactorings tend to start with the question from management that is frequently a variation of: “what are the worst parts of the application, and how can we make them better”. This sentence is poetry to a developer’s ear. A great chance to go over the entire application note down the pain points, look at technologies that might ease trouble, have lengthy discussions with colleagues about the architecture of the pesky service classes. Not only are you going to learn a ton on the technical side of things, socially you’re going to improve in ways of persuasion and proposing ideas.

After a while, the most significant part of the spec will be done. Moreover, I can guarantee you that you’ve never been so excited to work on the project before. You can now look at the project and see a road to be walked, where before it was just an end to a means.

Now comes the tricky part, refactoring one of those huge files. The first time you read over the class, you might get some doubts about this whole refactoring stuff. Luckily you stick to your means of attack and write your first end to end tests. Once you’ve established a safety net, you regain a big part of your courage.

Ok you think, this piece of code I might be able to extract to a separate class. You write the unit test. You extract the code, and everything is green. Ok, great start! Let’s do it again.

A few hours later you stare at the construction you’ve made. It’s a vast improvement of what it was before (every single indentation you fix is an improvement), but looking at the loose classes, you can see some definite improvements still. You could leave it as it is, and that would be great, or go further. Either path you chose, at one point you’re going to create a PR, and sit back and stare at the diff screen of your favourite git hosting service … what a beauty.

# Growing with the application
Working on applications like this is all about responsibility. Every decision you make as a team will impact you in the future, in a good way and sometimes in a not so good way.

This kind of pressure might sound like a burden, but in reality, it is indeed a blessing. It forces you to slow down and think about your actions as a team. Should I write a test for this? The answer is going to be yes, cause once it has a test, it’s going to part of the test coverage for maybe years to come.

So that’s the beauty of legacy code: You get a rough stone that you can shape into a gem. The pressure of delivering new features won’t be lower on a legacy application over Greenfield, but management often understands the need for refactoring and architectural meetings better.

Moreover, all the technologies and paradigms learned in the refactoring of legacy code are invaluable when you move on to Greenfield projects as you now have the context for the need for value objects, testing and decoupling.

So yes, if you’re about to start on a legacy code base. Lucky you. You’re about to have one hell of a ride.

Ps: Happy birthday Taylor Swift