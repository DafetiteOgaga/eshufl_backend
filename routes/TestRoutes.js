const express = require('express');
const router = express.Router();

const Tests = require('../models/TestQuestions')
const Randomize = require('../hooks/Randomize')
const shuffleArray = require('../hooks/shufflerHook')

// home endpoint
router.get('/', (req, res) => {
	res.send('Welcome to My World!\nWont you come on in?'); // ✅ Respond with a message
});

// all endpoints
const allPoints = {
	randomize: '/randomize',
	takeTests: '/take-tests',
	submitTests: '/submit-tests',
	preTests: '/pre-tests',
	createTests: '/create-tests',
	// contribute: '/contribute',
}

// ✏️ Randomize exam questions (POST request)
router.post(allPoints.randomize, async (req, res) => {
	const received = req.body;
	const downloadLink = await Randomize(received);
	console.log({ downloadLink });
	res.status(201).send({'success': 'Success', downloadLink});
});

  // ✏️ Submit/create new test questions (POST request)
router.post(allPoints.createTests, async (req, res) => {
	try {
		console.log('trying to create or update test ...');
		const { info, questions } = req.body;
		const { subject, typeCategory, classCategory } = info;

		console.log('formatting new queestions ...');
		const formattedQuestions = questions.map(q => ({
			question: q.question,
			options: q.options,
			correct_answer: q.correct_answer,
			image: q.image || null,
			explanation: q.explanation || '',
		}));

		console.log('checking if test document exists ...');
		const existingTest = await Tests.findOne({
			subject,
			typeCategory,
			classCategory,
		});

		if (existingTest) {
			console.log('found existing test document:', existingTest._id);
			// console.log('existingTest.questions:', existingTest.questions);
			console.log('checking if there are duplicate questions ...');
			const existingQuestions = existingTest.questions.map(question => question.question)
			// console.log('existingQuestions:', existingQuestions);
			const nonDuplicateQuestions = formattedQuestions.filter(question => !existingQuestions.includes(question.question));
			const numberOfDuplicateQuestions = formattedQuestions.length - nonDuplicateQuestions.length;
			console.log(`found ${numberOfDuplicateQuestions} duplicate questions ...`);
			console.log('nonDuplicateQuestions:', nonDuplicateQuestions);
			if (nonDuplicateQuestions.length > 0) {
				console.log('updating existing test ...');
				console.log('appending new non duplicate questions ...');
				existingTest.questions.push(...nonDuplicateQuestions);
				console.log('saving updated questions ...');
				await existingTest.save();

				console.log('appended questions to existing test document ...');
				res.status(200).json({ success: true, message: 'Questions appended', testId: existingTest._id });
			} else {
				console.log('no new questions to append to existing test document ...');
				res.status(200).json({ success: true, message: 'Questions appended', testId: existingTest._id });
			}
		} else {
			console.log('creating new test ...');
			const newTest = new Tests({
				subject,
				typeCategory,
				classCategory,
				questions: formattedQuestions,
			});
			console.log('saving new test ...');
			await newTest.save();

			console.log('created new test:', newTest._id);
			res.status(201).json({ success: true, message: 'New test created', testId: newTest._id });
		}
	} catch (error) {
		console.error('Error creating or updating test:', error);
		res.status(500).json({ error: 'Failed to create or update test.' });
	}
});

// ✏️ Submit answered test questions (POST request)
router.post(allPoints.submitTests, async (req, res) => {
	const received = req.body; // 🖥️ Log the request body
	// console.log(JSON.stringify(received, null, 2)); // 🖥️ Log the request body
	// const {email, name} = req.body; // 🧊 Create a user from request
	// await user.save(); // 💾 Save to database
	// const newUser = await User.create({email, name}); // 💾 Save to database
	// console.log({ newUser }); // 🖥️ Log the new user
	// res.status(201).send(newUser); // ✅ Respond with created user
	// const downloadLink = await Randomize(received); // 🔄 Randomize the data
	// console.log('take-tests:', received); // 🖥️ Log the result
	console.log(`${allPoints.submitTests} <<< :`, JSON.stringify(received, null, 2)); // 🖥️ Log the result
	res.status(201).send({'success': 'Success'}); // ✅ Respond with created user
});
// ✏️ Take test questions (GET request)
router.post(allPoints.takeTests, async (req, res) => {
	// const {received} = req.body;
	// console.log('take-tests (req):', req);
	// console.log('take-tests (req.body):', req.body);
	const info = req.body;
	console.log('take-tests:', info);
	const getQuestions = await Tests.findOne({
		subject: info.subject,
		typeCategory: info.typeCategory,
		classCategory: info.classCategory,
	});
	if (!getQuestions) {
		console.log('No test found for the given criteria.');
		return res.status(404).json({ error: 'Test not found.' });
	}
	console.log('Found test:', getQuestions);
	// console.log(
	// 	'\ninfo:', info,
	// 	'\nFound test:', getQuestions,
	// );
	const infoAndQuestions = {...getQuestions.toObject(), ...info}
	console.log('\n\n\nSent\ninfoAndQuestions:', infoAndQuestions);
	// const shuffledQuestions = shuffleArray(getQuestions.questions);
	// console.log('shuffledQuestions:', shuffledQuestions);
	// console.log(`${allPoints.takeTests} <<< :`, JSON.stringify(received, null, 2));
	// console.log({sendGet})
	res.send(infoAndQuestions); // ✅ Respond with a message
});

// ✏️ Request-test (POST request)
router.post(allPoints.preTests, async (req, res) => {
	// const received = req.body;
	// console.log(`${allPoints.preTests} <<< :`, JSON.stringify(received, null, 2));
	const {
		name,
		email,
		typeCategory,
		classCategory,
		subject,
		duration,
		id, } = req.body;
		console.log(
			'results:',{
					name,
					email,
					typeCategory,
					classCategory,
					subject,
					duration,
					id
				});
	// const tests = await Tests.find({
	// 	name,
	// 	email,
	// 	typeCategory,
	// 	classCategory,
	// 	subject,
	// 	duration })
	// console.log('tests:', { tests });
	// await user.save(); // 💾 Save to database
	// const newUser = await User.create({email, name}); // 💾 Save to database
	// console.log({ newUser }); // 🖥️ Log the new user
	// res.status(201).send(newUser); // ✅ Respond with created user
	// const downloadLink = await Randomize(received); // 🔄 Randomize the data
	// console.log('duration:', received.duration)
	res.status(201).send({
		'success': 'Success',
		'goto': allPoints.takeTests,
		'info': { name, email, typeCategory, classCategory, subject, duration, id },
	}); // ✅ Respond with created user
});

// 📂 Get all users
// router.get('/users', async (req, res) => {
//   const users = await User.find(); // 🔍 Get all users
//   console.log({ users }); // 🖥️ Log them
//   res.send(users); // ✅ Send them back
// });

module.exports = router;
