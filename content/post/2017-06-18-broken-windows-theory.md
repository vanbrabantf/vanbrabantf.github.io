---
layout: post
title:  "The broken windows theory or “Why some projects are just destined to suck”"
date: 2017-06-12
excerpt: "Why is it that most legacy software projects are not really fun to work on? How can we stop that greenfield project to turn into one of those dull big projects? I would argue that it’s all in the foundation."
featured: "/assets/posts/2017-06-18-broken-windows-theory/header.png"
tump: "/assets/posts/2017-06-18-broken-windows-theory/tump.png"
---
 
Why is it that most legacy software projects are not really fun to work on? How can we stop that greenfield project to turn into one of those dull big projects? I would argue that it’s all in the foundation.

## The broken windows theory

In 1982 James Q. Wilson and George L. Kelling wrote an article on a theory they had. 
It stated that once there is a building in a neighborhood that shows small signs of neglect (a mailbox that’s overflowing with a few days worth of mail, trash on the street, a broken window that stays broken, ...) the entire neighborhood devalues and opens itself up for more neglect.
 
The main idea here is twofold: 
 
  - People tend to care less about something that has a lower perceived value.
  - Small neglects can quickly damage the perceived value of the bigger system they are part of. 
 
Now please note, this is as the name suggests, just a theory. And a highly criticized one at that! The theory is often criticized for promoting stigmatisation and “zero tolerance” attitudes.
 
Now I’m not really big on sociology, so I’m not going to give personal insights into how the broken windows theory might work in a social or political environment. But we can try and see if we can maybe link some of it’s ideas to software projects.

## Sweat the small stuff

Let’s first start with looking at a piece of code. I’m going to take a piece of code from an open source project (In this case the [Slim framework build in PHP](https://www.slimframework.com/) made by [Josh Lockhart](https://twitter.com/codeguy))
 
{{< highlight php "linenos=table" >}}
<?php
    public function resolve($toResolve)
    {
        if (is_callable($toResolve)) {
            return $toResolve;
        }
 
        if (!is_string($toResolve)) {
            $this->assertCallable($toResolve);
        }
 
        // check for slim callable as "class:method"
        if (preg_match(self::CALLABLE_PATTERN, $toResolve, $matches)) {
            $resolved = $this->resolveCallable($matches[1], $matches[2]);
            $this->assertCallable($resolved);
 
            return $resolved;
        }
 
        $resolved = $this->resolveCallable($toResolve);
        $this->assertCallable($resolved);
        
        return $resolved;
    }
{{< / highlight >}}
This is the resolve method from the [CallableResolver class](https://github.com/slimphp/Slim/blob/3.x/Slim/CallableResolver.php)
 
Now it doesn’t really matter what the code does, but we can roughly see what is happening here. The code might not be perfect, you might even have seen something you would do in an other way. But the ideas are quickly shown.
 
Now see what happens if we do this:
 
{{< highlight php "linenos=table" >}}
<?php
function resolve($toResolve)
{
    if (is_callable($toResolve)) {
        return $toResolve;
    } else {
        if (!is_string($toResolve)) {
        $this->assertCallable($toResolve);
        }
        if (preg_match(self::CALLABLE_PATTERN, $toResolve, $m)) 
        {
        $r = $this->resolveCallable($m[1], $m[2]);
        $this->assertCallable($r);
        return $r;
        } else {
        $r = $this->resolveCallable($toResolve);
        $this->assertCallable($r);
        return $r;
        }
    }
}
{{< / highlight >}}
 
This is functionally the same method, so it does the same thing. I’ve just removed a few good practices like the early return, and some PSR rules. As you can see this code is a lot harder to understand.
 
I know most people don’t write code like that, and this is probably a bit over dramatised. You would not want the developer that wrote code like that in your team. But still, I would bet you have seen code like this before. Maybe even in a codebase you work in.
 
If we apply the broken window theory upon this code, we could argue that it all started with a small bit of neglect. Maybe it was friday afternoon, we’ve sent the original code in and a colleague commented that it misses a small use case. So we’ve quickly added it in, but forgot a bit of formatting. “Whatever, It’s friday and I have a paper airplane folding competition to attend! I’ll do it next week.”
 
You might think you or a colleague of yours will probably see this and fix it monday morning. But let’s be real here. That part of code will not only not get fixed, it will probably get worst.

## How can we prevent this happening?

The best way to keep these issues from appearing, is to never let them in the codebase in the first place. It is mostly a mentality thing. 

Here are a few tips that might help.


### The Boy scout rule

For the people who’ve never been in the “Boy Scouts of America”. Statistically, quite a lot of people. They supposedly have a rule (I didn’t actually found the rule, but that might be because I only know about boy scouts from Wes Anderson movies):
 
> Always leave the campground cleaner than you found it. If you find a mess on the ground, clean it up regardless of who might have made the mess.
 
[Robert C. Martin](https://twitter.com/unclebobmartin), whom you might know better as Uncle Bob, argues in his book [Clean Code](https://www.barnesandnoble.com/w/clean-code-robert-c-martin/1101628669?ean=9780132350884) that we could perfectly apply this mentality to programming. So every file you open, try and leave it a bit better then you’ve found it.
 
I would however suggest you do this in a separate branch/PR. What can get a bit tedious.
 
### Just automate it 

Of course you write tests (not writing tests in 2017 is like using bronzer for contouring in your make-up). So you probably already have a build server in your stack. Now luckily for us, we can automate the code style, and run “tests” against it in much the same way. With the added bonus of not having to write any kind of “style tests”.

### So what’s out there? 

[Scrutinizer](https://scrutinizer-ci.com/) is a popular one. It gives the option to assign a score to both the individual files and the entire project. The score is calculated on the rules you assign for your project (it ships with a standard rule set). If your commit sinks the score, it’s time to refactor.
 
Some alternatives like [Codacy](https://www.codacy.com/) and [Sideci](https://sideci.com/) even allow for the option to automatically add comments to a pull request. So it feels like a human is giving actual code reviews. This can be very handy for one person teams. (Note however that this is nowhere as good a real review from an actual colleague, at least not for now).
 
Now if you want to go 1 step further, there is this cool tool called [Grumphp](https://github.com/phpro/grumphp). Grumphp hooks into you Git commit hook and runs its test before commit. If the tests fail, you can’t commit. As a picture says more than a thousand words; check out this cool GIF I stole from their Github page:
 
![Grump example](https://github.com/phpro/grumphp/wiki/images/demo.gif)

### 6 weeks work 2 weeks cleanup
As you know, you can’t have an insightful blog post without at least one mention of [Jason Fried](https://twitter.com/jasonfried). In one of his [posts](https://m.signalvnoise.com/how-we-set-up-our-work-cbce3d3d9cae), Jason talks about how they work at [Basecamp](https://basecamp.com). Most of the article goes beyond the scope of this post (still a great read), but what really struck out for me was this part:
 
>Once a six week cycle is over, we take one or two weeks off of scheduled projects so everyone can roam independently, fix stuff up, pick up some pet projects we’ve wanted to do, and generally wind down prior to starting the next six week cycle. Ample time for context switching. We also use this time to firm up ideas that we’ll be tackling next cycle. More on this in a bit.
 
This is probably a hard sell to make to clients or your boss. But even if you could get to a “work 6 weeks on features do 2 weeks cleanup”, you could end up with a much cleaner and more workable project. Those practices allow for faster implementation of new features and most important of all: Happy developers.
 
## Conclusion
I truly believe that the broken window theory can be applied to software projects. In my personal experiences I’ve rarely seen a project start out as a total mess. If it ended up as a mess, it was gradually. I also believe that this is not necessary the fault of developers working on the project, think of it more as frogs in a pot with gradually increased temperature of water. One morning you just wake up and take a look at the project and realise that it has gotten really messy.
 
I think that the best way to counter these small neglects sneaking up in your code base is by really analyzing every pull request. Be it by manual code reviews from peers or by dedicated automated tools. In the best case both.
 
Another important thing to note is that senior developers are in no way immune to these mishaps. Skill level has in my opinion less to do with this kind of stuff. Everyone can have an off day, it just important that these off days don't stick around in the project.
