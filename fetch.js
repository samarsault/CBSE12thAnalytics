//
// Fetch all Data
// Generate Analytics
//
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

var addr = "http://cbseresults.nic.in/class12zpq/class12th18.asp";

module.exports = function(start, end, schoolNo, centreNo) {
	// var schoolNo = '06967', centreNo = '4016';
	var subjDic = { };
	var data = [ ];
	
	var analytics = {};
	var avg = {};
	
	analytics['aggr'] = [0,0,0,0,0];
	// assign analytics
	function assign(param, mark) {
		if (mark >= 95)
			param[4]++;
		else if (mark >= 90)
			param[3]++;
		else if (mark >= 85)
			param[2]++;
		else if (mark >= 80)
			param[1]++;
		else
			param[0]++;
	}
	
	function setAvg(param, mk) {
		param[0] += mk;
		param[1] += 1;
	}
	
	function fetch(roll) {

		if (roll > end) {
			// write data
			fs.writeFile('data.json', JSON.stringify(data), (err) => console.log(err));
			analytics['avg'] = {};
			analytics['subjDic'] = subjDic;
			
			for (var key in avg) {
				analytics['avg'][key] = parseFloat( (avg[key][0] / avg[key][1]).toFixed(2));
			}
			
			fs.writeFileSync('analytics.json', JSON.stringify(analytics));
			return;
		}
		
		console.log("Fetching: " + roll);
		request.post({
			url: addr,
			headers: {
				"host": "cbseresults.nic.in",
				"origin": "http://cbseresults.nic.in",
				"referer": "http://cbseresults.nic.in/class12zpq/class12th18.htm"
			},
			form: {
				regno: roll,
				sch: schoolNo,
				cno: centreNo
			}
		}, function(err, resp, body) {
			console.log("Status: " + resp.statusCode);
			if (err) {
				console.log(err);
				return;
			}
			var obj = { };
			var $ = cheerio.load(body);
			var $result = $($('table')[5]).find('tr');
			var $meta = $($('table')[4]);
			
			var name = $($($meta.find('tr')[1]).children()[1]).text().trim();
			
			obj['name'] = name;
			obj['roll'] = roll;
			// fetch only 5 subjects
			var counter = 0;
			var markDic = obj['marks'] = { };
			$result.each(function(i, el) {
				var $el = $(el);

				if (counter == 5) {
					var total = 0;
					for (k in markDic) {
						total+= markDic[k];
					}
					obj['total'] = total;
					assign(analytics['aggr'], total/5);
					data.push(obj);
					counter++;
				}
				
				if ($el.attr('bgcolor') != 'mediumblue' && counter < 5) // header/footer
				{
					var scode = $($el.children()[0]).text().trim();
					if (scode == '.')
						console.log(roll);
					if (!(scode in subjDic)) {
						var sname = $($el.children()[1]).text().trim();
						analytics[scode] = Array(5);
						analytics[scode].fill(0);	
						avg[scode] = [0, 0];		
						subjDic[scode] = sname;
					}
					var marks = parseInt($($el.children()[4]).text().trim());
					markDic[scode] = marks;
					assign(analytics[scode], marks);
					setAvg(avg[scode], marks);
					counter++;
				}
			});

			fetch(roll+1);
		});
	}
	
	// initiate
	fetch(start);
}