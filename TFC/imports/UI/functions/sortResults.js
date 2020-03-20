/**
 * Original code from http://www.javascriptkit.com/javatutors/arraysort2.shtml
 * 
 * Sort an array of products or shops in a given order
 * @param  {array}  arrayToSort
 * @param  {string} order
 */
sortResults = function(arrayToSort, order){
    arrayToSort.sort(function(a, b){
        var nameA = a.name.toLowerCase();
        var nameB = b.name.toLowerCase();
        if(order === 'A-Z'){
            //Sort in ascending order
            if (nameA < nameB){
                return -1
            }
            if (nameA > nameB){
                return 1
            }
            return 0  //default return value (no sorting)
        } else if(order === 'Z-A'){
            //Sort in descending order
            if (nameA < nameB){
                return 1
            }
            if (nameA > nameB){
                return -1
            }
            return 0  //default return value (no sorting)
        } else if(order === 'random'){
            // Code from https://javascript.info/task/shuffle
            return Math.random() - 0.5;  // Return randomly a positive or negative number
        }
    });
}
