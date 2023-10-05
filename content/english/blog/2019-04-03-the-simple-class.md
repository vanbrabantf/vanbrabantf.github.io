---
title: "The simple class"
meta_title: ""
description: "One of my favourite types of classes is a value object. For those not in the known, a value object is a small class that holds a value with a tiny bit of extra logic surrounding it. Sounds simple enough right? I think a nice way of looking at these classes is implementing them as an extension of the type system of your programming language. Let take a look at an uncomplicated example."
date: 2019-04-03T00:00:00Z
image: "/images/posts/2019-04-03-the-simple-class/header.jpg"
categories: ["Software", "Managing technology"]
author: "John Doe"
tags: ["Clean code", "software patterns"]
draft: false
---

I work in many legacy code bases, and in fact, I’ve made it a big part of my career. I love diving into big monoliths that have grown out of proportion and tidying them up. One of the best parts of that work is rewriting a God class into a collection of small reusable classes. Let’s take a look at what makes a simple class great.

One of my favourite types of classes is a value object. For those not in the known, a value object is a small class that holds a value with a tiny bit of extra logic surrounding it. Sounds simple enough right? I think a nice way of looking at these classes is implementing them as an extension of the type system of your programming language. Let take a look at an uncomplicated example.

```php
<?php
declare(strict_types=1);

final class CustomerName
{
    private $firstName;

    private $lastName;

    public function __construct(string $firstName, string $lastName)
    {
        $this->firstName = $firstName;
        $this->lastName = $lastName;
    }

    public function firstName(): string
    {
        return $this->firstName;
    }

    public function lastName(): string
    {
        return $this->lastName;
    }

    public function fullName(): string
    {
        return sprintf(
            '%s %s',
            $this->firstName(),
            $this->lastName()
        );
    }
}
```

This small class doesn’t do anything really, and it just holds two strings. The only tiny bit of function (on first glance) is that it concatenates the two strings. However, for the minimal amount of code in this class, it does offer a ton of value to your code base.

# Putting an end to the class struggle

Once we start replacing every occurrence of the first name and last name with this simple class, you will quickly begin to see the value. First of all, every time you come across this class in your code, you know that it has a first name and a last name in it. You also know that both of these values will be strings. And that you have an easy way to display the first name - last name combination.

You can now also add this as a safety in your new classes. You could, for example, do something like this:

```php
<?php
    public function sendMail(
        CustomerName $customerName,
        Email $email
    ): void
    {
        $mail = new Mail($customerName->fullName(), $email);

        // send mail
    }
```

Here you easily guard your method from all kinds of extra logic. You know that the variables that enter the method are of the type Email and Customer class.

There is however still a major issue with our values objects. We could still trick our system into accepting empty strings. Let’s take a look at how we can make these classes just a tiny bit more robust.

# Putting a stop to empty values

We know that our values in our object will always be of the type string, but “” is also a string. so you could do

`new CustomerName('', '');` or even `new CustomerName('\$', '!');`

You could allow that last one if you are building a platform for rappers, but in most cases, you would want to guard against that.

If you are using PHP (like the examples are), I would suggest using a package like [webmozart/assert](https://github.com/webmozart/assert).

```php
<?php
    public function __construct(string $firstName, string $lastName)
    {
        Assert::stringNotEmpty($firstName);
        Assert::stringNotEmpty($lastName);
        Assert::alpha($firstName);
        Assert::alpha($lastName);

        $this->firstName = $firstName;
        $this->lastName = $lastName;
    }
```

(you could add a private validation method to the class that is called on the first line of the constructor if there are many validation rules)

The class is now a lot smarter; it validates the values that come in and will throw an exception when they don’t meet the expectations of the class.

Now you can be sure that whenever you encounter this class, the values within will be usable.

# Adding more means of production to the classes

It might be very tempting to start now adding more and more logic to these classes. However, I would caution restraint here.

A common thing you see is people adding getters and setters to these classes. You might notice we already have getters (we just not named them getters), and I would strongly recommend against adding setters.

If you need to update a value in the class, create a new instance of the class. Value objects are meant to be built and discarded. By creating new value objects you also make sure you pass the constructor every time, and therefore including the validation.

If you really feel like adding setters, make sure they create new instances themselves:

```php
<?php
    public function setFirstName(string $firstName): CustomerName
    {
        return new self($firstName, $this->lastName());
    }
```

Another thing to touch upon is named constructors. A named constructor allows you to create the value object under different circumstances. I feel like it is easiest to explain with another example.

```php
<?php
declare(strict_types=1);

final class CustomerName
{
    private $firstName;

    private $lastName;

    public function __construct(string $firstName, string $lastName)
    {
        Assert::stringNotEmpty($firstName);
        Assert::stringNotEmpty($lastName);
        Assert::alpha($firstName);
        Assert::alpha($lastName);

        $this->firstName = $firstName;
        $this->lastName = $lastName;
    }

    public static function fromFullName(string $fullname): self
    {
        $pieces = explode(' ', $fullname);

        return new CustomerName($pieces[0], $pieces[1]);
    }
}
```

(this example is to demonstrate the function of a named constructor. This method assumes that a name is always in 2 pieces with the first name as the first piece. If you want to implement this, please add extra logic)

These constructors are a small convenient way to create the value object. Named constructors allow for great flexibility. However, like always, you should not take this flexibility too far.

You should always ask yourself, is this method solving a real problem, or am I just adding this for a one-off small convenience?

Named constructors are very useful in a “Time” class, where you can create the class from a string format, or from the hour, minute and second parameters as further explained [here](http://verraes.net/2014/06/named-constructors-in-php/) by [Mathias Verraes](https://twitter.com/mathiasverraes).

# In closing

There is still a lot to be said about value objects. We haven’t touched upon testing, logging, naming…

For more information about these topics, I would advise you to look into some DDD books or even better check out [Matthias Noback](https://twitter.com/matthiasnoback)’s book [“Style Guide for Object Design”](https://leanpub.com/object-design). A book that prompted me to write this article. (I get no personal benefits for advertising this book, I just think it’s a great book)

If you haven’t implemented Value objects into your codebase, I would greatly advise you to give it a try. You will wonder how you ever lived without it.

```

```
