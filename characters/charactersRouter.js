const express = require('express');

const Character = require('./Character.js');
const Film = require('../films/Film');
const Vehicle = require('../vehicles/Vehicle');

const router = express.Router();

// add endpoints here

router
    .route('/')
    .get(get)
    .post(post)

router
    .route('/:id')
    .get(getById)
    .put(put)
    .delete(destroy)

router
    .route('/:id/vehicles')
    .get(getVehicles)

function get(req, res) {
    let query = Character.find()
        .populate('homeworld', 'climate terrain name -_id')

    const { minheight, gender } = req.query;

    // if (gender) {
    //     query.where({ gender: { $regex: gender, $options: 'i' } });
    // }

    query.then(character => {
        if (minheight) {
            character = character.filter(char => {
                return char.height >= minheight;
            })
        }

        if (gender) {
            character = character.filter(char => {
                return char.gender == gender.toLowerCase();
            })
        }
        res.status(200).json(character);
    });
}

function getById(req, res) {
    // const { id } = req.params;

    // Character
    //     .findById(id)
    //     .populate('homeworld', 'climate terrain name -_id')
    //     .then(character => {
    //     res.status(200).json(character);
    // });
    const { id } = req.params;

    Character.findById(id)
        .select('name gender skin_color hair_color height eye_color birth_year -_id')
        .populate('homeworld', 'climate -_id')
        .then(char => {
            Film.find({ characters: id })
            .select('title -_id')
                .then(films => {
                    const character = { ...char._doc, movies: films };

                    res.status(200).json(character);
                });
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

function getVehicles(req, res) {
    const { id } = req.params;

    Character.findById(id)
        .select('name gender -_id')
        .populate('homeworld', 'name climate -_id')
        .then(char => {
            Film.find({ characters: id })
            .select('title -_id')
                .then(films => {
                    // const character = { ...char._doc, movies: films };
                    Vehicle.find({ pilots: id })
                        .select('vehicle_class -_id')
                        .then(response => {
                            const character = { ...char._doc, movies: films, vehicles: response };

                            res.status(200).json(character);
                        });
                })
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

function post(req, res) {
    const characterInfo = req.body;

    const character = new Character(characterInfo)

    character
        .save()
        .then(character => {
            Character.find().then(character => {
                res.status(200).json(character);
            });
        })
        .catch(err => {
            res.status(500).json(err);
        });
}

function put(req, res) {
    const { id } = req.params;
    const update = req.body;

    Character
        .findByIdAndUpdate(id, update)
        .then(character => {
            Character.find().then(character => {
                res.status(200).json(character);
            });
        });
}

function destroy(req, res) {
    const { id } = req.params;

    Character
        .findByIdAndRemove(id)
        .then(character => {
            Character.find().then(character => {
                res.status(200).json(character);
            });
        });
}

module.exports = router;
