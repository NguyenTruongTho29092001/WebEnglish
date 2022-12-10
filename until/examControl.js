const Vocabulary = require('..//app/model/vocabulary');
const Unit = require('..//app/model/units');
class ExamControl {
    constructor(userName, unitSslug){
        this.unitSlug = unitSslug;
        this.userName = userName
    }
    async init() {
        let unit = await Unit.findOne({ slug: this.unitSlug }) // lấy unit dựa theo cái unitSslug gửi xuống
        let vocabularies = await Vocabulary.find({ unitId: unit.id}) // lấy vocabulary dựa theo unit được gửi
        this.incorrectVocabularies = []; // tạo mảng những câu hỏi sai
        this.indexQuestion = 0;
        this.unitID = unit;
        this.vocabularies = vocabularies.sort((a,b) => Math.random() - 0.5); // hàm xáo trộn những câu hỏi đó với nhau 
    }
    length() {
        return this.vocabularies.length;
    }
    async getQuestion(){
        // 1 câu trả lời đúng
        let option = [this.vocabularies[this.indexQuestion].vietnamese]
        // lấy 3 đáp án bất kì và bắt buộc phải khác câu trả lời vừa rồi trong unit
        let optionOrder = await Vocabulary.aggregate([{
            $match: {
                "{vietnamese}": { $ne: option[0]} // ne: not equal
            },
        },{
             $sample: { size: 3 }
        }])            
        optionOrder.forEach(element => {
            option.push(element.vietnamese) // push ngược vào lại option trong đó có 1 đáp án đúng
        });
        option.sort(() => Math.random() - 0.5) // xáo trộn thứ tự đáp án
        return{
            index: this.indexQuestion,
            english: this.vocabularies[this.indexQuestion].english,
            type: this.vocabularies[this.indexQuestion].type,
            option: option,
        }
    }
    //kiểm tra đã kết thúc chưa " câu hiện tại có >= length hay k"
    isFinished(){
        console.log(this.indexQuestion,this.length())
        if(this.indexQuestion >= this.length){
            this.save()
            return true;
        }
        return false;
    }
    // kiểm tra đáp án đúng
    isAnswer(answer){
        if(this.isFinished()){
            throw 'Exam finished' // nếu đã là câu hỏi cuối thì in ra thông báo
        }
        if(answer.trim() == this.vocabularies[this.indexQuestion].vietnamese.trim()){
            this.indexQuestion++;
            return true;
        }
        if(this.incorrectVocabularies[this.incorrectVocabularies.length - 1] != this.vocabularies[this.indexQuestion]) {
            this.incorrectVocabularies.push(this.vocabularies[this.indexQuestion]);
        }
        return false
    }
    getIncorretVocabularies(){
        return this.incorrectVocabularies
    }
}
module.exports = ExamControl