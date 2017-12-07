---
layout: post
title:  "Atomic commits: Telling stories with Git"
date: 2017-12-07
excerpt: "These days I’m all into atomic commits and it really made my work beter. Never heard of that concept? No worries, let me introduce you to it"
featured: "/assets/posts/2017-12-7-atomic-commits/header.webp"
tump: "/assets/posts/2017-12-7-atomic-commits/tump.webp"
---

I always find it amazing to see how different people create pull requests. Some people like to put every file they’ve touched into one big commit. Other people split their commits up per file. There are even people that split it up according to domains.

I’ve been all these people at one point in my career, but these days I’m all into atomic commits. Never heard of that concept? No worries, let me introduce you to:

## The case for atomic commits

Atomic commits, sometimes also called micro commits, is the practice of explaining your thought process in the form of commit messages and code. It comes down to documenting the way to the solution.

An example is the easiest way to demo this.

Take for example this pseudo code:

```

class NewsController {

   public function index() {

       var items = Database.sql("select * from news");

       return NewsView.withItems(items);

   }

}

```

As you can see, pretty simple stuff: we get all the news items for the database and return some kind of view with the items.

Can you guess what happened to that file when you take a quick look at these commit messages:

![Final score](/assets/posts/2017-12-7-atomic-commits/atomic-commits.webp)

That’s all pretty clear right. But you might still be wondering why we created those empty tests stubs first. This is what happens when we click those `...`’s

![Final score](/assets/posts/2017-12-7-atomic-commits/atomic-commits-expanded.webp)

This is the basic idea behind atomic commits: Small commits that tell a story.

The best way to do this by making the commits along the coding of the feature. Look at a piece of code you have to write or refactor. You will start to see the things you need to do: first I have to create a file. Ok create the file, commit the file and explain why you need that file. Next I need to create a method, create empty method, commit. etc...

## Damn this is a lot of work

Yes it is. I’m not going to lie to you, this is something you will have to actively do. But I assure you it will improve your workflow.

Atomic commits will drive the quality of your code reviews on pull requests way up. People will not only see what you are doing, how you are doing it and the scope you are working in. It will also help with motivation.

I bet you’re not very stoked to start a review on this one:

![Final score](/assets/posts/2017-12-7-atomic-commits/big-pr.webp)

This is not a very fun thing to do, you will also not get a lot of great insights on this. People doze off or lose track half way through the review.

## Lowering the barrier

Not only will you get better code reviews, you will increase knowledge sharing inside the company along the way. If there are junior developers in the team, this can be a great tool to passively teach them some tips and tricks and even change their mindset on code.

They can fully see the workflow and thought process the committer made. And because a single commit is now a much smaller block of code everyone in the team can chime in and discuss the code.

This technique also has the great benefit of making cherry picking in GIT easier. Mostly because you always have very small units to work with.

## Conclusion

Atomic commits are not a new thing, they are even often described as a GIT best practice. Yet I don’t actually see them that often. People often either cite that it’s too much work (an excuse that seems to pop up on every good code practice thing), or that it will make their main branch too verbose (you can always GIT squash your commits before merging).

That said, I really hope you give this a shot. It might make your life and that of your team a small bit better. If not, you just have a feature that is a bit more verbose in your GIT history.


