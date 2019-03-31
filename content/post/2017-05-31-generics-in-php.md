---
date: "2017-05-31T00:00:00Z"
excerpt: 'So everyone is talking about this hip “new” kid on the block for PHP: Generics.
  The RFC is on the table and a lot of people are getting all excited about it, but
  you don’t fully see the excitement? Let’s explore what it’s all about!'
featured: /assets/posts/2017-05-31-generics-in-php/header.png
title: What the hell are Generics and would I want them in PHP?
tump: /assets/posts/2017-05-31-generics-in-php/tump.png
---

So everyone is talking about this hip “new” kid on the block for PHP: Generics. The RFC is on the table and a lot of people are getting all excited about it, but you don’t fully see the excitement? Let’s explore what it’s all about!

## What is the use case of a Generic?

Generics is not something new. Statically typed languages like [Java](https://docs.oracle.com/javase/tutorial/java/generics/types.html) and [C#](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/) have had them for ages. There are even some dynamically typed languages like [Dart](http://news.dartlang.org/2016/12/dart-121-generic-method-syntax.html) that implement them in their core. And even languages that don’t support Generics like for example Javascript can still support them with a 3rd party implementation, in the case of Javascript this would be [Typescript](https://www.typescriptlang.org/docs/handbook/generics.html).
 
The basic idea is that you can reuse a class that is statically typed with different typed parameters. OK, I understand that this might sound very confusing. So let's check out an example:
 
{{< highlight php "linenos=table" >}}
<?php
 
$car = new Car(4, 'Honda');
 
class Car
{
    private $wheels;
    private $engine;
 
    public function __construct($wheels, $engine)
    {
        $this->wheels = $wheels;
        $this->engine = $engine;
    }
    
    public function getWheels()
    {
        return $this->wheels;
    }
    
    public function getEngine()
    {
        return $this->engine;
    }
}
{{< / highlight >}}
Yes I know, I’m explaining OO stuff with a car class. I know it’s super cliche, and I’m normally not a fan of getters, but just roll with it.
 
As you can see, we are creating a `Car` object with 2 parameters. The wheels and the engine.
Now this is all fine and dandy, but what do `$wheels` and `$engine` parameters represent? In this case it’s the amount of wheels and what engine it sports one would assume, as we send an integer and a string along.
 
But `$car = new Car(‘pirelli’, true);` would be just as valid.
 
This is of course one of the typical things of a dynamically typed language. But if we want to add some more uniformity in our class we could, thanks to PHP 7 and types:
 
{{< highlight php "linenos=table" >}}
<?php
 
$car = new Car(4, 'Honda');
 
class Car
{
    private $wheels;
    private $engine;
 
    public function __construct(int $wheels, string $engine)
    {
        $this->wheels = $wheels;
        $this->engine = $engine;
    }
 
    public function getWheels(): int
    {
        return $this->wheels;
    }
 
    public function getEngine(): string
    {
        return $this->engine;
    }
}
{{< / highlight >}}
 
Now it’s impossible to create an invalid object thanks to the strict types. OK cool, let’s make everything strictly typed then!
 
But what if we want to create an object that’s both statically and dynamically typed? This sounds absurd but let me give you a use case. You want an object that accepts a parameter on creation but it needs to always return that same type of parameter on its return.
 
So for example when I do `$myCar = new Car('honda');` and later `$myCar->getEngine();` I want to be sure that what I get back from `getEngine` is the same type as what I’ve put into the constructor (in this case a string).
 
## OK show me this generic magic then!
Well… the thing is… at the time of writing, generics don’t yet exist in PHP yet. I know… what a tease. But luckily for us there is an [RFC](https://wiki.php.net/rfc/generics)! So people are still loudly arguing whether or not they want to include generics into PHP and how it should look. But let us take a look at what the current proposed way of doing it is.
 
The use case described above could look like this:
 
{{< highlight php "linenos=table" >}}
<?php
 
$car = new Car<int, string>(4, 'Honda');
 
class Car<WheelType, EngineType>
{
    private $wheels;
    private $engine;
 
    public function __construct(WheelType $wheels, EngineType $engine)
    {
        $this->wheels = $wheels;
        $this->engine = $engine;
    }
 
    public function getWheels(): WheelType
    {
        return $this->wheels;
    }
 
    public function getEngineType(): EngineType
    {
        return $this->engine;
    }
}
{{< / highlight >}}
As you can see, we now have brackets! So first up is this:
 
{{< highlight php "linenos=table" >}}$car = new Car<int,string>(4, 'Honda');{{< / highlight >}}
 
Here we say, we are going to create a new Car, with 2 parameters; an integer and a string. You could according to the currently proposed RFC just send:
 
{{< highlight php "linenos=table" >}}$car = new Car(4, 'Honda');{{< / highlight >}}
 
but I like the explicit version better for explanation sake. Next up is:
 
{{< highlight php "linenos=table" >}}class Car<WheelType, EngineType>{{< / highlight >}}
 
This tells the class about what variable types it supports.
And then we can use these virtual types just like normal types in the class.
 So in this case the `WheelType` will be an integer and the `EngineType` a string.
 
It’s as easy as that.
 
## That’s a use case that will never happen!
It is indeed a niche use case, but as PHP grows towards a hybrid of a dynamically typed and strictly typed language it does make sense to include some more features of strictly typed languages. While true, you will not use this everyday, there is no harm in having it in the language. It would however be handy for people that write logging or collection packages. Take this piece of code for example:
 
{{< highlight php "linenos=table" >}}
<?php
 
class Collection<EntryType>
{
    private $collection = [];
 
    public function addValue(EntryType $item)
    {
        $this->collection[] = $item;
    }
 
    public function getValues():array
    {
        return $this->collection;
    }
}
 
$collection = new Collection<string >();
$collection->addValue('this is a string');
 
$stringArray = $collection->getValues();
{{< / highlight >}}
 
You can now reuse this collection for whatever you want, but you will always be sure `getValues()` will return a collection of items that have the same type.
 
Even more fun is that you can instantiate a Collection like this: `$collection = new Collection<Runnable >();` where `Runnable` is an interface. This way you could have, for example, a collection that you are sure of only has items with values objects in them that conform to the interface. For example:
 
{{< highlight php "linenos=table" >}}
<?php

public function runBatch<T is Runnable>(T $batch) {
     foreach ($batch as $entry) {
           $entry->run(); // Runnable
     }
}
{{< / highlight >}}
 
The `<T is Runnable>` in this context would stand for: "you can enter whatever type you want here, but it has to adhere to the `Runnable` interface."

So what’s next?
As I said before, the proposal is currently in draft. Once the proposal is finished it will go into a voting round and if there is a consensus about implementing it, it will be added, otherwise it’s back to the drawing board for Generics in PHP.
 
p.s. you can follow along how the RFC is going [here](https://why-cant-we-have-nice-things.mwl.be/requests/introduce-generics-into-php)
